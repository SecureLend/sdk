import { parseEvent, signWebhook, verifyWebhook } from "../../src/webhooks";
import { ValidationError, WebhookSignatureError } from "../../src/utils/errors";

const RAW = JSON.stringify({
  type: "outcome.recorded",
  id: "evt_1",
  createdAt: "2026-10-14T00:00:00.000Z",
  tenantId: "ten_a",
  data: { state: "funded", reasonCode: null },
});

describe("webhooks", () => {
  it("accepts a fresh timestamped signature", () => {
    const now = 1_700_000_000_000;
    const header = signWebhook(RAW, "top-secret", 1_700_000_000);
    expect(
      verifyWebhook(RAW, header, "top-secret", {
        nowMs: now,
        toleranceSec: 300,
      }),
    ).toBe(true);
  });

  it("rejects a bad signature, an old timestamp, and a tampered body", () => {
    const now = 1_700_000_000_000;
    const header = signWebhook(RAW, "top-secret", 1_700_000_000);
    expect(() =>
      verifyWebhook(RAW, "t=1700000000,v1=abcd", "top-secret", { nowMs: now }),
    ).toThrow(WebhookSignatureError);
    expect(() =>
      verifyWebhook(RAW, header, "top-secret", {
        nowMs: now + 301_000,
        toleranceSec: 300,
      }),
    ).toThrow(/time window/);
    expect(() =>
      verifyWebhook(`${RAW} `, header, "top-secret", { nowMs: now }),
    ).toThrow(/did not match/);
  });

  it("parses a known event and an unknown future type", () => {
    const event = parseEvent(JSON.parse(RAW));
    expect(event.type).toBe("outcome.recorded");
    expect(event.data.state).toBe("funded");
    const future = parseEvent({
      type: "lead.future",
      id: "evt_2",
      createdAt: "2026-10-14T00:00:00.000Z",
      tenantId: "ten_a",
    });
    expect(future.type).toBe("lead.future");
    expect(future.data).toEqual({});
  });

  it("rejects an event without a type", () => {
    expect(() => parseEvent({ id: "evt_3" })).toThrow(ValidationError);
  });
});
