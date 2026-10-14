import { FeatureDisabledError, SecureLendError } from "../../src/utils/errors";
import { clientWith, jsonResponse, sent } from "./http";

jest.mock("../../src/utils/mcp");

describe("liquidity", () => {
  it("reads this workspace book", async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({
        view: "lender",
        groupBy: "state",
        cells: [{ key: "CA", leads: 1, matchRate: 1, fundedAmount: 10000 }],
      }),
    );
    const client = clientWith(fetchImpl);
    const report = await client.liquidity.get({
      groupBy: "state",
      from: "2026-10-01",
    });
    expect(report.cells[0].key).toBe("CA");
    expect(sent(fetchImpl)[0].url).toBe(
      "https://securelend.ai/v1/marketplace/liquidity?groupBy=state&from=2026-10-01",
    );
  });

  it("maps flag-off to FeatureDisabledError and a role failure to forbidden", async () => {
    const off = jest.fn(async () => jsonResponse({ error: "not_found" }, 404));
    await expect(clientWith(off).liquidity.get()).rejects.toBeInstanceOf(
      FeatureDisabledError,
    );
    const denied = jest.fn(async () =>
      jsonResponse({ error: "forbidden" }, 403),
    );
    await expect(clientWith(denied).liquidity.get()).rejects.toBeInstanceOf(
      SecureLendError,
    );
    await expect(clientWith(denied).liquidity.get()).rejects.not.toBeInstanceOf(
      FeatureDisabledError,
    );
  });
});
