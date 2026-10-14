import { z } from "zod";
import {
  AuthenticationError,
  ConsentRequiredError,
  FeatureDisabledError,
  InvalidTransitionError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  SecureLendError,
  ServerError,
  ValidationError,
} from "./utils/errors";

export interface FetchLike {
  (input: string, init?: RequestInit): Promise<Response>;
}

export interface RestClientOptions {
  baseUrl: string;
  apiKey?: string;
  fetchImpl?: FetchLike;
  maxRetries?: number;
  retryDelayMs?: number;
}

export interface RestRequest<T> {
  method: string;
  path: string;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  form?: FormData;
  schema: z.ZodType<T>;
  featureGated?: boolean;
  idempotencyKey?: string;
}

const CONSENT_CODES = new Set([
  "consent_required",
  "consent_revoked",
  "consent_expired",
]);

function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function newIdempotencyKey(): string {
  const cryptoRef = globalThis.crypto;
  if (cryptoRef && typeof cryptoRef.randomUUID === "function") {
    return cryptoRef.randomUUID();
  }
  return `idem_${Date.now().toString(16)}_${Math.random().toString(16).slice(2)}`;
}

function bearer(apiKey: string | undefined): string | undefined {
  if (!apiKey) return undefined;
  const trimmed = apiKey.trim();
  if (!trimmed) return undefined;
  return trimmed.toLowerCase().startsWith("bearer ")
    ? trimmed
    : `Bearer ${trimmed}`;
}

function retryDelay(response: Response, fallback: number): number {
  const header = response.headers.get("retry-after");
  if (header && /^\d+$/.test(header)) {
    return Math.min(Number(header) * 1000, 2000);
  }
  return fallback;
}

function validationMessage(code: string): string {
  if (code === "reason_required") return "A decline needs a reason code.";
  if (code === "funded_amount_required") return "Funded needs an amount.";
  if (code === "funded_date_required") {
    return "Funded needs a date as YYYY-MM-DD.";
  }
  if (code === "confirmation_required") {
    return "The lead needs confirmation before it is created.";
  }
  return "The request was not accepted.";
}

/**
 * Fetch transport for https://securelend.ai.
 * Tokens and response bodies are not written to logs.
 */
export class RestClient {
  private apiKey: string | undefined;
  private readonly baseUrl: string;
  private readonly fetchImpl: FetchLike | undefined;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;

  constructor(options: RestClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
    this.fetchImpl = options.fetchImpl;
    this.maxRetries = options.maxRetries ?? 2;
    this.retryDelayMs = options.retryDelayMs ?? 0;
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  async send<T>(request: RestRequest<T>): Promise<T> {
    const retries = request.form ? 0 : this.maxRetries;
    const url = this.url(request.path, request.query);
    const init = this.init(request);
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      let response: Response;
      try {
        response = await this.fetcher()(url, init);
      } catch (err) {
        const detail =
          err instanceof Error && err.message
            ? err.message.replace(/\s+/g, " ").slice(0, 180)
            : "";
        lastError = new NetworkError(
          detail
            ? `The request did not reach the server. ${detail}`
            : "The request did not reach the server.",
        );
        if (attempt < retries) {
          await sleep(this.retryDelayMs);
          continue;
        }
        throw lastError;
      }
      if (
        (response.status === 429 || response.status >= 500) &&
        attempt < retries
      ) {
        await sleep(retryDelay(response, this.retryDelayMs));
        continue;
      }
      return this.read(response, request);
    }
    throw (
      lastError || new NetworkError("The request did not reach the server.")
    );
  }

  private fetcher(): FetchLike {
    if (this.fetchImpl) return this.fetchImpl;
    if (typeof globalThis.fetch === "function") {
      return globalThis.fetch.bind(globalThis) as FetchLike;
    }
    throw new NetworkError("This runtime has no fetch implementation.");
  }

  private url(
    path: string,
    query: Record<string, string | number | undefined> | undefined,
  ): string {
    const suffix = path.startsWith("/") ? path : `/${path}`;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query || {})) {
      if (value == null || value === "") continue;
      params.set(key, String(value));
    }
    const qs = params.toString();
    return `${this.baseUrl}${suffix}${qs ? `?${qs}` : ""}`;
  }

  private init(request: RestRequest<unknown>): RequestInit {
    const headers: Record<string, string> = { accept: "application/json" };
    const authorization = bearer(this.apiKey);
    if (authorization) headers.authorization = authorization;
    const method = request.method.toUpperCase();
    if (method === "POST" || method === "PUT" || method === "PATCH") {
      headers["idempotency-key"] =
        request.idempotencyKey || newIdempotencyKey();
    }
    if (request.form) {
      return { method, headers, body: request.form };
    }
    if (request.body !== undefined) {
      headers["content-type"] = "application/json";
      return { method, headers, body: JSON.stringify(request.body) };
    }
    return { method, headers };
  }

  private async read<T>(
    response: Response,
    request: RestRequest<T>,
  ): Promise<T> {
    const text = await response.text();
    let payload: { error?: string; message?: string } | null = null;
    if (text) {
      try {
        payload = JSON.parse(text) as { error?: string; message?: string };
      } catch {
        payload = null;
      }
    }
    if (response.status >= 200 && response.status < 300) {
      try {
        return request.schema.parse(payload ?? {});
      } catch (err) {
        if (err instanceof z.ZodError) {
          throw new ValidationError(
            "The server response did not match the expected shape.",
            { issues: err.issues.map((issue) => issue.path.join(".")) },
          );
        }
        throw err;
      }
    }
    const code = String(payload?.error || "");
    const details = { status: response.status, error: code || undefined };
    if (response.status === 401 || code === "invalid_signature") {
      throw new AuthenticationError("The API key was not accepted.");
    }
    if (response.status === 429) {
      const retryAfter = response.headers.get("retry-after");
      throw new RateLimitError(
        "The request was rate limited.",
        retryAfter && /^\d+$/.test(retryAfter) ? Number(retryAfter) : undefined,
      );
    }
    if (CONSENT_CODES.has(code)) {
      const message =
        code === "consent_revoked"
          ? "This consent was revoked."
          : code === "consent_expired"
            ? "This consent has expired."
            : "A live consent is required before this package can be read.";
      throw new ConsentRequiredError(message, details);
    }
    if (code === "invalid_transition") {
      throw new InvalidTransitionError(
        "That outcome is not available.",
        details,
      );
    }
    if (
      request.featureGated &&
      (response.status === 404 ||
        (response.status === 403 &&
          (code === "not_found" || code === "feature_disabled")))
    ) {
      throw new FeatureDisabledError(
        "This feature is off for this workspace.",
        details,
      );
    }
    if (response.status === 404) {
      throw new NotFoundError("The record was not found.");
    }
    if (response.status === 403) {
      throw new SecureLendError(
        "This action is not available for this session.",
        "forbidden",
        details,
      );
    }
    if (response.status >= 500) {
      throw new ServerError("The server could not complete the request.");
    }
    throw new ValidationError(validationMessage(code), details);
  }
}
