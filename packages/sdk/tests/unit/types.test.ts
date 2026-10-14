import { leadOutcomeSchema, secureLendEventSchema, trackOfferStatusSchema } from "../../src/types";

describe("Zod Type Schemas", () => {
  describe("trackOfferStatusSchema", () => {
    it("should fail validation if both applicationId and email are missing", () => {
      const result = trackOfferStatusSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Either applicationId or email must be provided.",
        );
      }
    });

    it("should pass validation if applicationId is present", () => {
      const result = trackOfferStatusSchema.safeParse({ applicationId: "123" });
      expect(result.success).toBe(true);
    });

    it("should pass validation if email is present", () => {
      const result = trackOfferStatusSchema.safeParse({
        email: "test@example.com",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("platform loop schemas", () => {
    it("keeps an unknown outcome state", () => {
      const parsed = leadOutcomeSchema.parse({
        id: "out_1",
        leadId: "enquiry_1",
        lenderId: "ten_a",
        state: "future_state",
      });
      expect(parsed.state).toBe("future_state");
    });

    it("keeps an unknown event type", () => {
      const parsed = secureLendEventSchema.parse({
        type: "lead.future",
        id: "evt_1",
        createdAt: "2026-10-14T00:00:00.000Z",
        tenantId: "ten_a",
        data: { extra: true },
      });
      expect(parsed.type).toBe("lead.future");
      expect(parsed.data).toEqual({ extra: true });
    });
  });
});
