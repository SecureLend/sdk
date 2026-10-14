import { z } from "zod";
import { PLATFORM_ROUTES } from "../contract";
import { RestClient } from "../rest";
import {
  packageSchema,
  type PackageRecord,
  type PackageStartInput,
} from "../types/platform";
import {
  AuthenticationError,
  ConsentRequiredError,
  NotFoundError,
  SecureLendError,
  ValidationError,
} from "../utils/errors";

const rpcSchema = z
  .object({
    result: z
      .object({
        structuredContent: z.unknown().optional(),
        content: z
          .array(
            z
              .object({
                type: z.string(),
                text: z.string().optional(),
              })
              .passthrough(),
          )
          .optional(),
        isError: z.boolean().optional(),
      })
      .passthrough()
      .optional(),
    error: z
      .object({
        message: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

function payloadOf(rpc: z.infer<typeof rpcSchema>): Record<string, unknown> {
  const structured = rpc.result?.structuredContent;
  if (
    structured &&
    typeof structured === "object" &&
    !Array.isArray(structured)
  ) {
    return structured as Record<string, unknown>;
  }
  const text = rpc.result?.content?.find((item) => item.type === "text")?.text;
  if (text) {
    try {
      const parsed = JSON.parse(text) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      throw new ValidationError(
        "The package response did not include a result.",
      );
    }
  }
  throw new ValidationError("The package response did not include a result.");
}

function raiseToolError(payload: Record<string, unknown>): void {
  const code = typeof payload.error === "string" ? payload.error : "";
  if (!code) return;
  if (
    code === "consent_required" ||
    code === "consent_revoked" ||
    code === "consent_expired"
  ) {
    throw new ConsentRequiredError(
      code === "consent_revoked"
        ? "This consent was revoked."
        : "A live consent is required before this package can be read.",
      { error: code },
    );
  }
  if (code === "not_found")
    throw new NotFoundError("The record was not found.");
  if (code === "sign_in_required") {
    throw new AuthenticationError("The API key was not accepted.");
  }
  throw new SecureLendError("The package request failed.", code, {
    error: code,
  });
}

/**
 * Lender package tools. Calls POST /v1/lender/mcp on the REST host.
 * Comparison tools are not sent here.
 */
export class Packages {
  constructor(private readonly rest: RestClient) {}

  async start(input: PackageStartInput): Promise<PackageRecord> {
    if (
      !input?.borrower ||
      input.amount == null ||
      !input.currency ||
      !input.security
    ) {
      throw new ValidationError(
        "A package needs a borrower, amount, currency, and security.",
      );
    }
    return this.call("start_underwriting_package", { ...input });
  }

  async read(
    id: string,
    options: { version?: number } = {},
  ): Promise<PackageRecord> {
    const packageId = String(id || "").trim();
    if (!packageId) throw new ValidationError("A package id is required.");
    const args: Record<string, unknown> = { caseId: packageId, packageId };
    if (options.version != null) args.packageVersion = options.version;
    return this.call("read_package", args);
  }

  private async call(
    name: string,
    args: Record<string, unknown>,
  ): Promise<PackageRecord> {
    const rpc = await this.rest.send({
      method: "POST",
      path: PLATFORM_ROUTES.lenderMcp,
      body: {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name, arguments: args },
      },
      schema: rpcSchema,
    });
    if (rpc.error) {
      throw new SecureLendError("The package request failed.", "mcp_error", {
        message: rpc.error.message,
      });
    }
    const payload = payloadOf(rpc);
    raiseToolError(payload);
    return packageSchema.parse(payload);
  }
}
