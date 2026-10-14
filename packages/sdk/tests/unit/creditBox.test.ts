import { FeatureDisabledError } from "../../src/utils/errors";
import { clientWith, jsonResponse, sent } from "./http";

jest.mock("../../src/utils/mcp");

const box = {
  version: 1,
  lenderId: "ten_a",
  criteria: { products: ["business_loan"], states: ["CA"] },
  capacityPerWeek: 5,
  status: "active",
  pausedUntil: null,
};

describe("credit box", () => {
  it("maps a flag-off read to FeatureDisabledError", async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({ error: "not_found" }, 404),
    );
    const client = clientWith(fetchImpl);
    await expect(client.creditBox.get()).rejects.toBeInstanceOf(
      FeatureDisabledError,
    );
    expect(sent(fetchImpl)[0].url).toBe("https://securelend.ai/v1/credit-box");
  });

  it("saves criteria and pauses with an until date", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(box, 201))
      .mockResolvedValueOnce(
        jsonResponse({ ...box, version: 2, status: "paused" }, 201),
      );
    const client = clientWith(fetchImpl);
    await client.creditBox.put({
      criteria: { products: ["business_loan"], states: ["CA"] },
      capacityPerWeek: 5,
    });
    await client.creditBox.pause({ until: "2099-01-01T00:00:00.000Z" });
    expect(JSON.parse(String(sent(fetchImpl)[0].body)).capacityPerWeek).toBe(5);
    expect(sent(fetchImpl)[1].url).toBe(
      "https://securelend.ai/v1/credit-box/pause",
    );
    expect(JSON.parse(String(sent(fetchImpl)[1].body)).until).toBe(
      "2099-01-01T00:00:00.000Z",
    );
  });
});
