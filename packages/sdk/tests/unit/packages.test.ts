import { ConsentRequiredError } from "../../src/utils/errors";
import { clientWith, jsonResponse, sent } from "./http";

jest.mock("../../src/utils/mcp");

describe("packages", () => {
  it("starts a package on the lender route", async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({
        result: {
          structuredContent: {
            caseId: "case_1",
            packageId: "case_1",
            deskUrl: "https://securelend.ai/files/case_1",
          },
        },
      }),
    );
    const client = clientWith(fetchImpl);
    const started = await client.packages.start({
      borrower: "Ada Co",
      amount: 25000,
      currency: "USD",
      security: "unsecured",
    });
    expect(started.caseId).toBe("case_1");
    const call = sent(fetchImpl)[0];
    expect(call.url).toBe("https://securelend.ai/v1/lender/mcp");
    expect(String(call.url)).not.toContain("mcp.securelend.ai");
    const body = JSON.parse(String(call.body));
    expect(body.params.name).toBe("start_underwriting_package");
  });

  it("maps a revoked consent to ConsentRequiredError", async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({ error: "consent_revoked" }, 403),
    );
    const client = clientWith(fetchImpl);
    await expect(
      client.packages.read("case_1", { version: 2 }),
    ).rejects.toBeInstanceOf(ConsentRequiredError);
    const body = JSON.parse(String(sent(fetchImpl)[0].body));
    expect(body.params.name).toBe("read_package");
    expect(body.params.arguments.packageVersion).toBe(2);
  });
});
