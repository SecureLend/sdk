import { clientWith, jsonResponse, sent } from "./http";

jest.mock("../../src/utils/mcp");

describe("matches", () => {
  it("returns generationId and components from a match run", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          items: [
            {
              id: "enquiry_1",
              productType: "business_loans",
              amount: 25000,
              lenders: [],
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          metadata: {
            generationId: "gen_1",
            match: [
              {
                lenderId: "ten_a",
                score: 0.4,
                rules: 0.5,
                fit: 1,
                outcome: 0.2,
                sba: 0,
                samples: 12,
              },
            ],
          },
        }),
      );
    const client = clientWith(fetchImpl);
    const ranked = await client.matches.list("enquiry_1");
    expect(ranked.generationId).toBe("gen_1");
    expect(ranked.lenders[0].components?.rules).toBe(0.5);
    expect(ranked.lenders[0].components?.outcome).toBe(0.2);
    expect(sent(fetchImpl)[1].url).toBe(
      "https://securelend.ai/v1/placement/compare",
    );
    expect(JSON.parse(String(sent(fetchImpl)[1].body))).toMatchObject({
      productType: "business_loans",
      loanAmount: 25000,
      amount: 25000,
    });
  });

  it("sends the personal_loan alias as personal_loans", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          items: [
            {
              id: "enquiry_1",
              productType: "personal_loan",
              amount: 10000,
              lenders: [],
            },
          ],
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ metadata: { match: [] } }));
    const client = clientWith(fetchImpl);
    const ranked = await client.matches.list("enquiry_1");
    expect(ranked.generationId).toBeNull();
    expect(ranked.lenders).toEqual([]);
    expect(JSON.parse(String(sent(fetchImpl)[1].body)).productType).toBe(
      "personal_loans",
    );
  });

  it("does not compare business_loan, which is not a catalog key", async () => {
    const fetchImpl = jest.fn().mockResolvedValueOnce(
      jsonResponse({
        items: [
          {
            id: "enquiry_1",
            productType: "business_loan",
            amount: 50000,
            lenders: [{ id: "ten_a", name: "Ada Bank" }],
          },
        ],
      }),
    );
    const client = clientWith(fetchImpl);
    const ranked = await client.matches.list("enquiry_1");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(ranked.generationId).toBeNull();
    expect(ranked.lenders[0].lenderId).toBe("ten_a");
  });

  it("does not compare a product the directory cannot rank", async () => {
    const fetchImpl = jest.fn().mockResolvedValueOnce(
      jsonResponse({
        items: [
          {
            id: "enquiry_1",
            productType: "factoring",
            amount: 25000,
            lenders: [{ id: "securelend-desk", name: "SecureLend" }],
          },
        ],
      }),
    );
    const client = clientWith(fetchImpl);
    const ranked = await client.matches.list("enquiry_1");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(ranked.generationId).toBeNull();
    expect(ranked.lenders[0]).toMatchObject({
      lenderId: "securelend-desk",
      components: null,
    });
  });

  it("does not compare a loan product that has no amount", async () => {
    const fetchImpl = jest.fn().mockResolvedValueOnce(
      jsonResponse({
        items: [
          {
            id: "enquiry_1",
            productType: "personal_loans",
            lenders: [{ id: "ten_a", name: "Ada Bank" }],
          },
        ],
      }),
    );
    const client = clientWith(fetchImpl);
    const ranked = await client.matches.list("enquiry_1");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(ranked.lenders[0].components).toBeNull();
  });

  it("keeps the lead lenders when outcome matching is off", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          items: [
            {
              id: "enquiry_1",
              productType: "personal_loans",
              amount: 10000,
              lenders: [{ id: "ten_a", name: "Ada Bank" }],
            },
          ],
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ metadata: {} }));
    const client = clientWith(fetchImpl);
    const ranked = await client.matches.list("enquiry_1");
    expect(ranked.generationId).toBeNull();
    expect(ranked.lenders[0]).toMatchObject({
      lenderId: "ten_a",
      components: null,
    });
  });
});
