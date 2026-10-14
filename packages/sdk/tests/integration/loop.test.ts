/**
 * @jest-environment node
 */
// Full place-to-underwrite loop. Skipped unless SECURELEND_API_URL is set.
// The API process must enable ledger, leadOutcomes, shareConsent, and outcomeMatching.
import { SecureLend } from "../../src/client";
import { ConsentRequiredError } from "../../src/utils/errors";

const baseUrl = process.env.SECURELEND_API_URL || "";
const apiKey = process.env.SECURELEND_API_KEY || "test.admin.ten_tobias.ada";
const describeLive = baseUrl ? describe : describe.skip;

describeLive("place to underwrite loop", () => {
  jest.setTimeout(60000);

  it("shares a package, records outcomes, and keeps feedback on the match", async () => {
    const client = new SecureLend({ apiKey, apiBaseUrl: baseUrl });
    const lead = await client.leads.create({
      confirmed: true,
      legalName: "Bea Borrower",
      email: "bea@borrower.test",
      productType: "personal_loans",
      amount: 25000,
      lenders: [
        {
          id: "securelend-desk",
          name: "SecureLend",
          email: "bank@example.com",
        },
      ],
    });
    expect(lead.id).toMatch(/^enquiry_/);

    const started = await client.packages.start({
      borrower: "NASDAQ: OPTX",
      amount: 25000,
      currency: "USD",
      security: "unsecured",
    });
    const packageId = started.caseId || started.packageId || started.id;
    expect(packageId).toBeTruthy();

    const [consent] = await client.consents.create({
      leadId: lead.id,
      packageId: String(packageId),
      packageVersion: 1,
      scope: ["summary", "memo", "checks", "documents"],
      expiresAt: "2099-01-01T00:00:00.000Z",
      borrowerRef: "borrower-bea",
    });
    expect(consent.id).toMatch(/^cns_/);

    const opened = await client.packages.read(String(packageId), {
      version: 1,
    });
    expect(opened.caseId || opened.packageId || opened.id).toBeTruthy();
    const receipts = await client.consents.receipts(consent.id);
    expect(receipts.some((row) => row.event === "opened")).toBe(true);

    await client.consents.revoke(consent.id);
    await expect(
      client.packages.read(String(packageId)),
    ).rejects.toBeInstanceOf(ConsentRequiredError);

    await client.outcomes.record(lead.id, {
      state: "info_requested",
      lenderId: "securelend-desk",
    });
    await client.outcomes.record(lead.id, {
      state: "term_sheet",
      lenderId: "securelend-desk",
    });
    const funded = await client.outcomes.record(lead.id, {
      state: "funded",
      lenderId: "securelend-desk",
      fundedAmount: 10000,
      fundedOn: "2026-10-14",
    });
    expect(funded.state).toBe("funded");

    if (lead.caseId) {
      const feedback = await client.feedback.listForCase(lead.caseId);
      expect(feedback.some((row) => row.targetKind === "lead_match")).toBe(
        true,
      );
    }

    const ranked = await client.matches.list(lead.id);
    expect(Array.isArray(ranked.lenders)).toBe(true);
    // The desk seed stores factoring unless its notify row uses a compare product.
    // Factoring is not sent to compare. A catalog product must come back ranked.
    const comparable = new Set([
      "personal_loans",
      "personal_loan",
      "installment_loan",
      "business_loans",
      "personal_mortgages",
      "business_mortgages",
      "car_loans",
      "student_loans",
    ]);
    if (comparable.has(String(lead.productType || ""))) {
      expect(typeof ranked.generationId).toBe("string");
      expect(ranked.generationId).toBeTruthy();
      for (const row of ranked.lenders) {
        expect(row.components).not.toBeNull();
      }
    }
  });
});
