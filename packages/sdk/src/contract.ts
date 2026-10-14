/**
 * Platform routes the REST client calls.
 * Comparison tools stay on the MCP host and are not listed here.
 */
export const PLATFORM_ROUTES = {
  createLead: "/v1/placement/enquiries",
  listLeads: "/v1/leads",
  uploadLeadDocument: "/v1/placement/enquiries/:id/documents",
  compare: "/v1/placement/compare",
  lenderMcp: "/v1/lender/mcp",
  consents: "/v1/share-consents",
  revokeConsent: "/v1/share-consents/:id/revoke",
  receipts: "/v1/share-receipts",
  outcomes: "/v1/leads/:id/outcomes",
  creditBox: "/v1/credit-box",
  pauseCreditBox: "/v1/credit-box/pause",
  resumeCreditBox: "/v1/credit-box/resume",
  feedback: "/v1/feedback",
  caseFeedback: "/v1/cases/:id/feedback",
  liquidity: "/v1/marketplace/liquidity",
} as const;

export function routeWithId(template: string, id: string): string {
  return template.replace(":id", encodeURIComponent(id));
}
