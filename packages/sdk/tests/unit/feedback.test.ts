import { FeatureDisabledError, ValidationError } from "../../src/utils/errors";
import { clientWith, jsonResponse, sent } from "./http";

jest.mock("../../src/utils/mcp");

describe("feedback", () => {
  it("rejects a rating without a score", async () => {
    const fetchImpl = jest.fn();
    const client = clientWith(fetchImpl);
    await expect(
      client.feedback.submit({
        type: "rating",
        target: { kind: "lead_match", key: "ten_a" },
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("posts feedback and lists it for a case", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: "fb_1" }, 201))
      .mockResolvedValueOnce(
        jsonResponse({
          items: [
            {
              id: "fb_1",
              type: "reject",
              targetKind: "lead_match",
              targetKey: "ten_a",
            },
          ],
        }),
      );
    const client = clientWith(fetchImpl);
    const created = await client.feedback.submit({
      type: "reject",
      target: { kind: "lead_match", key: "ten_a" },
      comment: "dscr",
    });
    expect(created.id).toBe("fb_1");
    const items = await client.feedback.listForCase("case/1");
    expect(items[0].targetKind).toBe("lead_match");
    expect(sent(fetchImpl)[0].url).toBe("https://securelend.ai/v1/feedback");
    expect(sent(fetchImpl)[1].url).toBe(
      "https://securelend.ai/v1/cases/case%2F1/feedback",
    );
  });

  it("maps a flag-off post to FeatureDisabledError", async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({ error: "not_found" }, 404),
    );
    const client = clientWith(fetchImpl);
    await expect(
      client.feedback.submit({
        type: "comment",
        target: { kind: "tool", key: "memo" },
        comment: "note",
      }),
    ).rejects.toBeInstanceOf(FeatureDisabledError);
  });
});
