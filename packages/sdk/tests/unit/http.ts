import { SecureLend } from "../../src/client";
import type { SecureLendConfig } from "../../src/types";

export function jsonResponse(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
): Response {
  const lower: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    lower[key.toLowerCase()] = value;
  }
  return {
    status,
    headers: { get: (name: string) => lower[name.toLowerCase()] ?? null },
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

export function clientWith(
  fetchImpl: jest.Mock,
  config: { apiKey?: string; apiBaseUrl?: string } = {},
): SecureLend {
  return new SecureLend({
    apiKey: config.apiKey ?? "test.admin.ten_a.ada",
    apiBaseUrl: config.apiBaseUrl,
    fetch: fetchImpl as unknown as SecureLendConfig["fetch"],
  });
}

export function sent(fetchImpl: jest.Mock): Array<{
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: BodyInit | null;
}> {
  return fetchImpl.mock.calls.map((call) => {
    const [url, init] = call as [string, RequestInit | undefined];
    return {
      url,
      method: init?.method,
      headers: init?.headers as Record<string, string> | undefined,
      body: init?.body,
    };
  });
}
