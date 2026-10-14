import { z } from "zod";
import { PLATFORM_ROUTES, routeWithId } from "../contract";
import { RestClient } from "../rest";
import {
  DECLINE_REASON_CODES,
  OUTCOME_STATES,
  leadOutcomeSchema,
  type LeadOutcome,
  type OutcomeRecordInput,
  type RequestOptions,
} from "../types/platform";
import { ValidationError } from "../utils/errors";
import { signOutcomePayload } from "../webhooks";

const outcomeListSchema = z
  .object({ items: z.array(leadOutcomeSchema) })
  .passthrough();

export class Outcomes {
  constructor(private readonly rest: RestClient) {}

  /**
   * Declined without a reason code, and funded without an amount and date,
   * fail here and do not call the server.
   */
  async record(
    leadId: string,
    input: OutcomeRecordInput,
    options: RequestOptions = {},
  ): Promise<LeadOutcome> {
    const id = String(leadId || "").trim();
    const state = String(input?.state || "").trim();
    if (!id) throw new ValidationError("A lead id is required.");
    if (!OUTCOME_STATES.includes(state as (typeof OUTCOME_STATES)[number])) {
      throw new ValidationError("That outcome state is not recognized.");
    }
    const reasonCode = input.reasonCode ? String(input.reasonCode).trim() : "";
    if (state === "declined") {
      if (
        !DECLINE_REASON_CODES.includes(
          reasonCode as (typeof DECLINE_REASON_CODES)[number],
        )
      ) {
        throw new ValidationError("A decline needs a reason code.");
      }
      if (reasonCode === "other" && !String(input.reasonText || "").trim()) {
        throw new ValidationError("A decline needs a reason code.");
      }
    }
    if (state === "funded") {
      const amount = Number(input.fundedAmount);
      const date = String(input.fundedOn || "").trim();
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new ValidationError("Funded needs an amount.");
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new ValidationError("Funded needs a date as YYYY-MM-DD.");
      }
    }
    const body: Record<string, unknown> = { state };
    if (input.lenderId) body.lenderId = input.lenderId;
    if (reasonCode) body.reasonCode = reasonCode;
    if (input.reasonText) body.reasonText = input.reasonText;
    if (state === "funded") {
      body.fundedAmount = Number(input.fundedAmount);
      body.fundedOn = String(input.fundedOn);
    }
    if (input.surface) body.surface = input.surface;
    return this.rest.send({
      method: "POST",
      path: routeWithId(PLATFORM_ROUTES.outcomes, id),
      body,
      schema: leadOutcomeSchema,
      featureGated: true,
      idempotencyKey: options.idempotencyKey,
    });
  }

  async list(leadId: string): Promise<LeadOutcome[]> {
    const id = String(leadId || "").trim();
    if (!id) throw new ValidationError("A lead id is required.");
    const page = await this.rest.send({
      method: "GET",
      path: routeWithId(PLATFORM_ROUTES.outcomes, id),
      schema: outcomeListSchema,
      featureGated: true,
    });
    return page.items;
  }

  /** Header value for POST /v1/webhooks/lender-outcomes. */
  signPayload(rawBody: string, secret: string): string {
    return signOutcomePayload(rawBody, secret);
  }
}
