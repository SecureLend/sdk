import { FeatureDisabledError, ValidationError } from "../../src/utils/errors";
import { verifyWebhook } from "../../src/webhooks";
import { clientWith, jsonResponse, sent } from "./http";

jest.mock("../../src/utils/mcp");

const outcome = {
  id: "out_1",
  leadId: "enquiry_1",
  lenderId: "ten_a",
  state: "funded",
  fundedAmount: 10000,
  fundedOn: "2026-10-14",
};

describe("outcomes", () => {
  it("rejects a decline without a reason before the request", async () => {
    const fetchImpl = jest.fn();
    const client = clientWith(fetchImpl);
    await expect(
      client.outcomes.record("enquiry_1", { state: "declined" }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects funded without an amount or a date", async () => {
    const fetchImpl = jest.fn();
    const client = clientWith(fetchImpl);
    await expect(
      client.outcomes.record("enquiry_1", {
        state: "funded",
        fundedOn: "2026-10-14",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(
      client.outcomes.record("enquiry_1", {
        state: "funded",
        fundedAmount: 10,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("records a funded outcome and lists rows", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(outcome, 201))
      .mockResolvedValueOnce(jsonResponse({ items: [outcome] }));
    const client = clientWith(fetchImpl);
    const saved = await client.outcomes.record("enquiry_1", {
      state: "funded",
      fundedAmount: 10000,
      fundedOn: "2026-10-14",
      lenderId: "ten_a",
    });
    expect(saved.state).toBe("funded");
    const listed = await client.outcomes.list("enquiry_1");
    expect(listed).toHaveLength(1);
    expect(sent(fetchImpl)[0].url).toBe(
      "https://securelend.ai/v1/leads/enquiry_1/outcomes",
    );
    expect(JSON.parse(String(sent(fetchImpl)[0].body))).toMatchObject({
      state: "funded",
      fundedAmount: 10000,
      fundedOn: "2026-10-14",
    });
  });

  it("maps a flag-off list to FeatureDisabledError", async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({ error: "not_found" }, 404),
    );
    const client = clientWith(fetchImpl);
    await expect(client.outcomes.list("enquiry_1")).rejects.toBeInstanceOf(
      FeatureDisabledError,
    );
  });

  it("signs a payload the platform verifier accepts", () => {
    const client = clientWith(jest.fn());
    const raw = JSON.stringify({ leadId: "enquiry_1", state: "viewed" });
    const header = client.outcomes.signPayload(raw, "hook-secret");
    expect(header.startsWith("sha256=")).toBe(true);
    expect(verifyWebhook(raw, header, "hook-secret")).toBe(true);
    expect(() => verifyWebhook(`${raw} `, header, "hook-secret")).toThrow(
      /did not match/,
    );
  });
});
