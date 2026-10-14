import { PLATFORM_ROUTES } from "../contract";
import { RestClient } from "../rest";
import {
  creditBoxSchema,
  creditBoxViewSchema,
  type CreditBox,
  type CreditBoxView,
  type CreditBoxWriteInput,
  type RequestOptions,
} from "../types/platform";
import { ValidationError } from "../utils/errors";

export class CreditBoxClient {
  constructor(private readonly rest: RestClient) {}

  async get(): Promise<CreditBoxView> {
    return this.rest.send({
      method: "GET",
      path: PLATFORM_ROUTES.creditBox,
      schema: creditBoxViewSchema,
      featureGated: true,
    });
  }

  async put(
    input: CreditBoxWriteInput | Record<string, unknown>,
    options: RequestOptions = {},
  ): Promise<CreditBox> {
    const body = writeBody(input);
    return this.rest.send({
      method: "PUT",
      path: PLATFORM_ROUTES.creditBox,
      body,
      schema: creditBoxSchema,
      featureGated: true,
      idempotencyKey: options.idempotencyKey,
    });
  }

  async pause(
    input: { until?: string } = {},
    options: RequestOptions = {},
  ): Promise<CreditBox> {
    return this.rest.send({
      method: "POST",
      path: PLATFORM_ROUTES.pauseCreditBox,
      body: input.until ? { until: input.until } : {},
      schema: creditBoxSchema,
      featureGated: true,
      idempotencyKey: options.idempotencyKey,
    });
  }

  async resume(options: RequestOptions = {}): Promise<CreditBox> {
    return this.rest.send({
      method: "POST",
      path: PLATFORM_ROUTES.resumeCreditBox,
      body: {},
      schema: creditBoxSchema,
      featureGated: true,
      idempotencyKey: options.idempotencyKey,
    });
  }
}

function writeBody(
  input: CreditBoxWriteInput | Record<string, unknown>,
): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ValidationError("A credit box needs criteria.");
  }
  if ("criteria" in input) {
    const criteria = input.criteria;
    if (!criteria || typeof criteria !== "object" || Array.isArray(criteria)) {
      throw new ValidationError("A credit box needs criteria.");
    }
    return input as Record<string, unknown>;
  }
  return { criteria: input };
}
