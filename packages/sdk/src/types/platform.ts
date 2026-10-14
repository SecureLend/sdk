import { z } from "zod";

/**
 * Response enums are plain strings so a new server value does not crash the client.
 * Request checks use the known lists below.
 */
export const OUTCOME_STATES = [
  "viewed",
  "info_requested",
  "declined",
  "term_sheet",
  "approved",
  "funded",
  "withdrawn",
] as const;

export const DECLINE_REASON_CODES = [
  "outside_credit_box",
  "industry",
  "time_in_business",
  "dscr",
  "collateral",
  "amount",
  "state",
  "credit_score",
  "docs_incomplete",
  "capacity",
  "other",
] as const;

export const SHARE_SCOPES = ["summary", "memo", "checks", "documents"] as const;

export const FEEDBACK_TYPES = [
  "rating",
  "edit",
  "comment",
  "approve",
  "reject",
  "regenerate",
] as const;

export const FEEDBACK_TARGETS = [
  "memo_section",
  "memo",
  "tool",
  "decision",
  "lead_match",
] as const;

export const EVENT_TYPES = [
  "lead.created",
  "lead.matched",
  "lead.notified",
  "package.shared",
  "package.opened",
  "consent.revoked",
  "outcome.recorded",
  "credit_box.updated",
  "feedback.recorded",
] as const;

export const leadSchema = z
  .object({
    id: z.string(),
    tenantId: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    productType: z.string().nullable().optional(),
    amount: z.number().nullable().optional(),
    legalName: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    caseId: z.string().nullable().optional(),
    lenders: z
      .array(
        z
          .object({
            id: z.string().nullable().optional(),
            name: z.string().optional(),
            tenantId: z.string().nullable().optional(),
          })
          .passthrough(),
      )
      .optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough();
export type Lead = z.infer<typeof leadSchema>;

export const leadListSchema = z
  .object({
    items: z.array(leadSchema),
    tenantId: z.string().optional(),
  })
  .passthrough();

export const uploadResultSchema = z
  .object({
    key: z.string().optional(),
    filename: z.string().optional(),
    documentType: z.string().optional(),
    applicationId: z.string().optional(),
  })
  .passthrough();
export type UploadResult = z.infer<typeof uploadResultSchema>;

export const matchComponentsSchema = z
  .object({
    rules: z.number().nullable().optional(),
    fit: z.number().nullable().optional(),
    outcome: z.number().nullable().optional(),
    sba: z.number().nullable().optional(),
    samples: z.number().nullable().optional(),
  })
  .passthrough();
export type MatchComponents = z.infer<typeof matchComponentsSchema>;

export const lenderMatchSchema = z
  .object({
    lenderId: z.string().nullable().optional(),
    score: z.number().nullable().optional(),
    components: matchComponentsSchema.nullable().optional(),
    generationId: z.string().nullable().optional(),
  })
  .passthrough();
export type LenderMatch = z.infer<typeof lenderMatchSchema>;

export const matchListSchema = z
  .object({
    leadId: z.string(),
    generationId: z.string().nullable().optional(),
    lenders: z.array(lenderMatchSchema),
  })
  .passthrough();
export type MatchList = z.infer<typeof matchListSchema>;

export const packageSchema = z
  .object({
    packageId: z.string().optional(),
    caseId: z.string().optional(),
    id: z.string().optional(),
    generationId: z.string().nullable().optional(),
    auth: z.string().optional(),
    error: z.string().optional(),
    deskUrl: z.string().optional(),
  })
  .passthrough();
export type PackageRecord = z.infer<typeof packageSchema>;

export const shareConsentSchema = z
  .object({
    id: z.string(),
    leadId: z.string(),
    packageId: z.string(),
    packageVersion: z.number(),
    lenderId: z.string().optional(),
    scope: z.array(z.string()),
    expiresAt: z.string(),
    revokedAt: z.string().nullable().optional(),
    borrowerRef: z.string().optional(),
    grantedAt: z.string().optional(),
  })
  .passthrough();
export type ShareConsent = z.infer<typeof shareConsentSchema>;

export const shareReceiptSchema = z
  .object({
    id: z.string(),
    consentId: z.string(),
    event: z.string(),
    createdAt: z.string(),
    lenderId: z.string().optional(),
  })
  .passthrough();
export type ShareReceipt = z.infer<typeof shareReceiptSchema>;

export const leadOutcomeSchema = z
  .object({
    id: z.string(),
    leadId: z.string(),
    lenderId: z.string(),
    state: z.string(),
    reasonCode: z.string().nullable().optional(),
    reasonText: z.string().nullable().optional(),
    fundedAmount: z.number().nullable().optional(),
    fundedOn: z.string().nullable().optional(),
    surface: z.string().optional(),
    feedbackId: z.string().nullable().optional(),
    matchGenerationId: z.string().nullable().optional(),
    createdAt: z.string().optional(),
  })
  .passthrough();
export type LeadOutcome = z.infer<typeof leadOutcomeSchema>;

export const creditBoxSchema = z
  .object({
    version: z.number(),
    lenderId: z.string().optional(),
    criteria: z.record(z.unknown()).optional(),
    capacityPerWeek: z.number().nullable().optional(),
    status: z.string(),
    pausedUntil: z.string().nullable().optional(),
    createdAt: z.string().optional(),
  })
  .passthrough();
export type CreditBox = z.infer<typeof creditBoxSchema>;

export const creditBoxViewSchema = z
  .object({
    current: creditBoxSchema.nullable(),
    versions: z.array(creditBoxSchema),
  })
  .passthrough();
export type CreditBoxView = z.infer<typeof creditBoxViewSchema>;

export const feedbackEventSchema = z
  .object({
    id: z.string(),
    generationId: z.string().nullable().optional(),
    caseId: z.string().nullable().optional(),
    surface: z.string().optional(),
    type: z.string(),
    rating: z.number().nullable().optional(),
    comment: z.string().nullable().optional(),
    targetKind: z.string().optional(),
    targetKey: z.string().optional(),
    createdAt: z.string().optional(),
  })
  .passthrough();
export type FeedbackEvent = z.infer<typeof feedbackEventSchema>;

export const feedbackCreatedSchema = z
  .object({
    id: z.string(),
  })
  .passthrough();
export type FeedbackCreated = z.infer<typeof feedbackCreatedSchema>;

export const liquidityCellSchema = z
  .object({
    key: z.string(),
    leads: z.number(),
    matchRate: z.number().nullable().optional(),
    responseRate48h: z.number().nullable().optional(),
    medianResponseMs: z.number().nullable().optional(),
    termSheetRate: z.number().nullable().optional(),
    fundedRate: z.number().nullable().optional(),
    fundedAmount: z.number().nullable().optional(),
    lenderCount: z.number().optional(),
  })
  .passthrough();
export type LiquidityCell = z.infer<typeof liquidityCellSchema>;

export const liquidityReportSchema = z
  .object({
    view: z.string(),
    groupBy: z.string(),
    cells: z.array(liquidityCellSchema),
  })
  .passthrough();
export type LiquidityMetrics = z.infer<typeof liquidityReportSchema>;

export const secureLendEventSchema = z
  .object({
    type: z.string(),
    id: z.string(),
    createdAt: z.string(),
    tenantId: z.string(),
    data: z.record(z.unknown()).optional(),
  })
  .passthrough();
export type SecureLendEvent = z.infer<typeof secureLendEventSchema>;

export interface LeadCreateInput {
  confirmed?: boolean;
  legalName?: string;
  email?: string;
  productType?: string;
  amount?: number;
  lenders?: Array<{
    id?: string;
    name?: string;
    email?: string;
    tenantId?: string;
  }>;
  [key: string]: unknown;
}

export interface LeadListFilter {
  status?: string;
}

export interface UploadFile {
  filename: string;
  bytes: Uint8Array;
  mime?: string;
  documentType?: string;
}

export interface PackageStartInput {
  borrower: string;
  amount: number;
  currency: string;
  security: "unsecured" | "secured";
  guarantees?: Array<Record<string, unknown>>;
  purpose?: string;
  tenorMonths?: number;
  amortisation?: string;
  pricing?: string;
}

export interface ConsentCreateInput {
  leadId: string;
  packageId: string;
  packageVersion: number;
  lenderIds?: string[];
  scope?: string[];
  expiresAt: string;
  borrowerRef: string;
}

export interface OutcomeRecordInput {
  lenderId?: string;
  state: string;
  reasonCode?: string;
  reasonText?: string;
  fundedAmount?: number;
  fundedOn?: string;
  surface?: string;
}

export interface CreditBoxWriteInput {
  criteria: Record<string, unknown>;
  capacityPerWeek?: number;
  lenderId?: string;
}

export interface FeedbackSubmitInput {
  type: string;
  rating?: number;
  comment?: string;
  generationId?: string;
  caseId?: string;
  surface?: string;
  target: { kind: string; key: string };
  before?: string;
  after?: string;
}

export interface LiquidityQuery {
  groupBy?: "product" | "amount_band" | "state" | "naics" | string;
  from?: string;
  to?: string;
}

export interface RequestOptions {
  idempotencyKey?: string;
}
