import { FeatureDisabledError, ValidationError } from "../../src/utils/errors";
import { clientWith, jsonResponse, sent } from "./http";

jest.mock("../../src/utils/mcp");

const consent = {
  id: "cns_1",
  leadId: "enquiry_1",
  packageId: "case_1",
  packageVersion: 1,
  lenderId: "ten_a",
  scope: ["summary"],
  expiresAt: "2099-01-01T00:00:00.000Z",
  borrowerRef: "borrower-1",
};

describe("consents", () => {
  it("rejects an email reference before the request", async () => {
    const fetchImpl = jest.fn();
    const client = clientWith(fetchImpl);
    await expect(
      client.consents.create({
        leadId: "enquiry_1",
        packageId: "case_1",
        packageVersion: 1,
        expiresAt: "2099-01-01T00:00:00.000Z",
        borrowerRef: "ada@example.com",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("posts one row per lender id", async () => {
    const fetchImpl = jest.fn(async () => jsonResponse(consent, 201));
    const client = clientWith(fetchImpl);
    const rows = await client.consents.create({
      leadId: "enquiry_1",
      packageId: "case_1",
      packageVersion: 1,
      lenderIds: ["ten_a", "ten_b"],
      scope: ["summary", "memo"],
      expiresAt: "2099-01-01T00:00:00.000Z",
      borrowerRef: "borrower-1",
    });
    expect(rows).toHaveLength(2);
    const bodies = sent(fetchImpl).map((call) => JSON.parse(String(call.body)));
    expect(bodies.map((body) => body.lenderId)).toEqual(["ten_a", "ten_b"]);
    expect(sent(fetchImpl)[0].url).toBe(
      "https://securelend.ai/v1/share-consents",
    );
  });

  it("maps a flag-off 404 to FeatureDisabledError", async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({ error: "not_found" }, 404),
    );
    const client = clientWith(fetchImpl);
    await expect(client.consents.list()).rejects.toBeInstanceOf(
      FeatureDisabledError,
    );
  });

  it("filters receipts by consent id", async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({
        items: [
          {
            id: "rcp_1",
            consentId: "cns_1",
            event: "opened",
            createdAt: "2026-10-14T00:00:00.000Z",
          },
          {
            id: "rcp_2",
            consentId: "cns_9",
            event: "opened",
            createdAt: "2026-10-14T00:00:00.000Z",
          },
        ],
      }),
    );
    const client = clientWith(fetchImpl);
    const rows = await client.consents.receipts("cns_1");
    expect(rows.map((row) => row.id)).toEqual(["rcp_1"]);
  });
});
