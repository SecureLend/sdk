import { z } from "zod";
import { PLATFORM_ROUTES } from "../contract";
import { RestClient } from "../rest";
import {
  leadListSchema,
  matchComponentsSchema,
  matchListSchema,
  type MatchList,
} from "../types/platform";
import { NotFoundError, ValidationError } from "../utils/errors";

const compareSchema = z
  .object({
    metadata: z
      .object({
        generationId: z.string().optional(),
        match: z.array(z.record(z.unknown())).optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

/** Loan products the placement directory can compare. Any other string makes that process throw. */
const COMPARE_LOAN_PRODUCTS = new Set([
  "personal_loans",
  "business_loans",
  "personal_mortgages",
  "business_mortgages",
  "car_loans",
  "student_loans",
]);

const COMPARE_STATIC_PRODUCTS = new Set([
  "personal_credit_cards",
  "business_credit_cards",
  "personal_banking",
  "business_banking",
  "savings_accounts",
]);

/**
 * Canonical compare key, or null when the lead product must not be sent.
 * Aliases match the platform normalizer. Singular names such as business_loan do not.
 */
export function compareProductKey(value: unknown): string | null {
  const raw = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^compare_/, "")
    .replace(/[\s-]+/g, "_");
  if (!raw) return null;
  if (COMPARE_LOAN_PRODUCTS.has(raw) || COMPARE_STATIC_PRODUCTS.has(raw)) {
    return raw;
  }
  if (raw === "personal_loan" || raw === "installment_loan") {
    return "personal_loans";
  }
  return null;
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

export class Matches {
  constructor(private readonly rest: RestClient) {}

  /**
   * Runs a match for this lead. generationId is set when outcome matching is on.
   * With the flag off, the lead's own lenders are returned and the ranking is unchanged.
   */
  async list(leadId: string): Promise<MatchList> {
    const id = String(leadId || "").trim();
    if (!id) throw new ValidationError("A lead id is required.");
    const page = await this.rest.send({
      method: "GET",
      path: PLATFORM_ROUTES.listLeads,
      query: { status: "all" },
      schema: leadListSchema,
    });
    const lead = page.items.find((row) => row.id === id);
    if (!lead) throw new NotFoundError("The record was not found.");
    const product = compareProductKey(lead.productType);
    const amount = numberOrNull(lead.amount);
    const needsAmount = product != null && COMPARE_LOAN_PRODUCTS.has(product);
    if (!product || (needsAmount && !(amount != null && amount > 0))) {
      return matchListSchema.parse({
        leadId: id,
        generationId: null,
        lenders: (lead.lenders || []).map((lender) => ({
          lenderId: lender.id ?? null,
          score: null,
          generationId: null,
          components: null,
        })),
      });
    }
    const compared = await this.rest.send({
      method: "POST",
      path: PLATFORM_ROUTES.compare,
      body: {
        productType: product,
        ...(amount != null && amount > 0 ? { loanAmount: amount, amount } : {}),
      },
      schema: compareSchema,
    });
    const generationId = compared.metadata?.generationId ?? null;
    const rows = compared.metadata?.match;
    const lenders = Array.isArray(rows)
      ? rows.map((row) => ({
          lenderId: stringOrNull(row.lenderId),
          score: numberOrNull(row.score),
          generationId,
          components: matchComponentsSchema.parse({
            rules: numberOrNull(row.rules),
            fit: numberOrNull(row.fit),
            outcome: numberOrNull(row.outcome),
            sba: numberOrNull(row.sba),
            samples: numberOrNull(row.samples),
          }),
        }))
      : (lead.lenders || []).map((lender) => ({
          lenderId: lender.id ?? null,
          score: null,
          generationId: null,
          components: null,
        }));
    return matchListSchema.parse({ leadId: id, generationId, lenders });
  }
}
