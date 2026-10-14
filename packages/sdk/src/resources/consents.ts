import { z } from "zod";
import { PLATFORM_ROUTES, routeWithId } from "../contract";
import { RestClient } from "../rest";
import {
  SHARE_SCOPES,
  shareConsentSchema,
  shareReceiptSchema,
  type ConsentCreateInput,
  type RequestOptions,
  type ShareConsent,
  type ShareReceipt,
} from "../types/platform";
import { ValidationError } from "../utils/errors";

const consentListSchema = z
  .object({ items: z.array(shareConsentSchema) })
  .passthrough();
const receiptListSchema = z
  .object({ items: z.array(shareReceiptSchema) })
  .passthrough();

export class Consents {
  constructor(private readonly rest: RestClient) {}

  /**
   * One consent row per lender id. The live route stores a row only when the
   * lender id is the session tenant. Omit lenderIds to use that default.
   */
  async create(
    input: ConsentCreateInput,
    options: RequestOptions = {},
  ): Promise<ShareConsent[]> {
    const leadId = String(input?.leadId || "").trim();
    const packageId = String(input?.packageId || "").trim();
    const borrowerRef = String(input?.borrowerRef || "").trim();
    if (!leadId || !packageId) {
      throw new ValidationError("A consent needs a lead and a package.");
    }
    if (!Number.isInteger(input.packageVersion) || input.packageVersion < 1) {
      throw new ValidationError("A consent needs a package version.");
    }
    if (!input.expiresAt)
      throw new ValidationError("A consent needs an expiry.");
    if (!borrowerRef)
      throw new ValidationError("A borrower reference is required.");
    if (borrowerRef.includes("@")) {
      throw new ValidationError(
        "Use a reference you choose. Do not type an email or an account number.",
      );
    }
    const scope = input.scope?.length ? input.scope : ["summary"];
    if (
      scope.some(
        (item) => !SHARE_SCOPES.includes(item as (typeof SHARE_SCOPES)[number]),
      )
    ) {
      throw new ValidationError(
        "Scope must be summary, memo, checks, or documents.",
      );
    }
    const lenderIds = input.lenderIds?.length ? input.lenderIds : [undefined];
    const saved: ShareConsent[] = [];
    for (const lenderId of lenderIds) {
      const body: Record<string, unknown> = {
        leadId,
        packageId,
        packageVersion: input.packageVersion,
        scope,
        expiresAt: input.expiresAt,
        borrowerRef,
      };
      if (lenderId) body.lenderId = lenderId;
      saved.push(
        await this.rest.send({
          method: "POST",
          path: PLATFORM_ROUTES.consents,
          body,
          schema: shareConsentSchema,
          featureGated: true,
          idempotencyKey: options.idempotencyKey,
        }),
      );
    }
    return saved;
  }

  async list(leadId?: string): Promise<ShareConsent[]> {
    const page = await this.rest.send({
      method: "GET",
      path: PLATFORM_ROUTES.consents,
      schema: consentListSchema,
      featureGated: true,
    });
    if (!leadId) return page.items;
    return page.items.filter((row) => row.leadId === leadId);
  }

  async revoke(
    id: string,
    options: RequestOptions = {},
  ): Promise<ShareConsent> {
    const consentId = String(id || "").trim();
    if (!consentId) throw new ValidationError("A consent id is required.");
    return this.rest.send({
      method: "POST",
      path: routeWithId(PLATFORM_ROUTES.revokeConsent, consentId),
      body: {},
      schema: shareConsentSchema,
      featureGated: true,
      idempotencyKey: options.idempotencyKey,
    });
  }

  async receipts(id?: string): Promise<ShareReceipt[]> {
    const page = await this.rest.send({
      method: "GET",
      path: PLATFORM_ROUTES.receipts,
      schema: receiptListSchema,
      featureGated: true,
    });
    if (!id) return page.items;
    return page.items.filter((row) => row.consentId === id);
  }
}
