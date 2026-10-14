import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { secureLendEventSchema, type SecureLendEvent } from "./types/platform";
import { ValidationError, WebhookSignatureError } from "./utils/errors";

export interface VerifyWebhookOptions {
  toleranceSec?: number;
  nowMs?: number;
}

function rawBytes(raw: string | Buffer): Buffer {
  return Buffer.isBuffer(raw) ? raw : Buffer.from(raw, "utf8");
}

function safeEqualHex(expected: string, presented: string): boolean {
  const left = Buffer.from(expected, "utf8");
  const right = Buffer.from(presented, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * Lender outcome header used by POST /v1/webhooks/lender-outcomes.
 * sha256 of secret + "." + raw body. The live route does not check a timestamp.
 */
export function signOutcomePayload(
  raw: string | Buffer,
  secret: string,
): string {
  const digest = createHash("sha256")
    .update(String(secret || ""), "utf8")
    .update(".")
    .update(rawBytes(raw))
    .digest("hex");
  return `sha256=${digest}`;
}

/**
 * Timestamped HMAC-SHA256 of `${timestamp}.${body}`.
 * Header shape: t=<unix seconds>,v1=<hex>.
 */
export function signWebhook(
  raw: string | Buffer,
  secret: string,
  timestampSec = Math.floor(Date.now() / 1000),
): string {
  const mac = createHmac("sha256", String(secret || ""))
    .update(`${timestampSec}.`)
    .update(rawBytes(raw))
    .digest("hex");
  return `t=${timestampSec},v1=${mac}`;
}

function readStamp(header: string): { t: number; mac: string } | null {
  const match = header.match(/(?:^|,\s*)t=(\d+),v1=([a-fA-F0-9]+)/);
  if (!match) return null;
  return { t: Number(match[1]), mac: match[2].toLowerCase() };
}

/**
 * Accepts the platform lender-outcome header and the timestamped HMAC header.
 * A timestamped header outside the tolerance is rejected.
 */
export function verifyWebhook(
  rawBody: string | Buffer,
  signatureHeader: string | null | undefined,
  secret: string,
  options: VerifyWebhookOptions = {},
): true {
  const header = String(signatureHeader || "").trim();
  const key = String(secret || "");
  if (!key || !header) {
    throw new WebhookSignatureError("Webhook signature did not match.");
  }
  const stamp = readStamp(header);
  if (stamp) {
    const tolerance = options.toleranceSec ?? 300;
    const nowSec = Math.floor((options.nowMs ?? Date.now()) / 1000);
    if (!Number.isFinite(stamp.t) || Math.abs(nowSec - stamp.t) > tolerance) {
      throw new WebhookSignatureError(
        "This webhook is outside the time window.",
      );
    }
    const expected = signWebhook(rawBody, key, stamp.t).split("v1=")[1] || "";
    if (!safeEqualHex(expected, stamp.mac)) {
      throw new WebhookSignatureError("Webhook signature did not match.");
    }
    return true;
  }
  const presented = header
    .replace(/^sha256=/i, "")
    .trim()
    .toLowerCase();
  const expected = signOutcomePayload(rawBody, key).replace(/^sha256=/, "");
  if (!safeEqualHex(expected, presented)) {
    throw new WebhookSignatureError("Webhook signature did not match.");
  }
  return true;
}

/** Parses an event. An unknown type string is kept and does not throw. */
export function parseEvent(
  input: unknown,
): SecureLendEvent & { data: Record<string, unknown> } {
  try {
    const event = secureLendEventSchema.parse(input);
    return { ...event, data: event.data ?? {} };
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new ValidationError(
        "The webhook event did not match the expected shape.",
        {
          issues: err.issues.map((issue) => issue.path.join(".")),
        },
      );
    }
    throw err;
  }
}
