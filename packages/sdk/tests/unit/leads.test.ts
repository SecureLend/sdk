import { SecureLend } from "../../src/client";
import { MCPClient } from "../../src/utils/mcp";
import { NotFoundError } from "../../src/utils/errors";
import { clientWith, jsonResponse, sent } from "./http";

jest.mock("../../src/utils/mcp");

const MCPClientMock = MCPClient as unknown as jest.Mock;

describe("leads", () => {
  beforeEach(() => {
    MCPClientMock.mockClear();
  });

  it("keeps the comparison host and calls the REST base", async () => {
    const fetchImpl = jest.fn(async () => jsonResponse({ items: [] }));
    const client = clientWith(fetchImpl);
    await client.leads.list();
    expect(MCPClientMock).toHaveBeenCalledWith({
      apiKey: "test.admin.ten_a.ada",
      mcpURL: "https://mcp.securelend.ai/mcp",
    });
    const call = sent(fetchImpl)[0];
    expect(call.url).toBe("https://securelend.ai/v1/leads?status=pending");
    expect(call.headers?.authorization).toBe("Bearer test.admin.ten_a.ada");
    expect(JSON.stringify(call)).not.toMatch(/sk_live|secret/i);
  });

  it("creates a lead with an idempotency key and retries a 500", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ error: "unavailable" }, 500))
      .mockResolvedValueOnce(
        jsonResponse({ id: "enquiry_1", status: "pending" }, 201),
      );
    const client = clientWith(fetchImpl);
    const lead = await client.leads.create(
      { confirmed: true, legalName: "Ada" },
      { idempotencyKey: "idem-1" },
    );
    expect(lead.id).toBe("enquiry_1");
    const calls = sent(fetchImpl);
    expect(calls).toHaveLength(2);
    expect(calls[0].url).toBe("https://securelend.ai/v1/placement/enquiries");
    expect(calls[0].headers?.["idempotency-key"]).toBe("idem-1");
    expect(calls[0].body).toBe(
      JSON.stringify({ confirmed: true, legalName: "Ada" }),
    );
  });

  it("finds a lead in the workspace list", async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({ items: [{ id: "enquiry_9", status: "pending" }] }),
    );
    const client = clientWith(fetchImpl);
    await expect(client.leads.get("missing")).rejects.toBeInstanceOf(
      NotFoundError,
    );
    const found = await client.leads.get("enquiry_9");
    expect(found.id).toBe("enquiry_9");
    expect(sent(fetchImpl)[0].url).toContain("status=all");
  });

  it("uploads one request per file", async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({ filename: "note.pdf", applicationId: "enquiry_1" }, 201),
    );
    const client = clientWith(fetchImpl);
    const saved = await client.leads.uploadDocuments("enquiry/1", [
      {
        filename: "note.pdf",
        bytes: new Uint8Array([1, 2]),
        documentType: "invoice",
      },
    ]);
    expect(saved[0].filename).toBe("note.pdf");
    expect(sent(fetchImpl)[0].url).toBe(
      "https://securelend.ai/v1/placement/enquiries/enquiry%2F1/documents",
    );
    expect(sent(fetchImpl)[0].body).toBeInstanceOf(FormData);
  });

  it("does not retarget a custom comparison URL", () => {
    new SecureLend({ serverUrl: "https://mcp.securelend.ai/mcp", apiKey: "k" });
    expect(MCPClientMock).toHaveBeenCalledWith({
      apiKey: "k",
      mcpURL: "https://mcp.securelend.ai/mcp",
    });
  });
});
