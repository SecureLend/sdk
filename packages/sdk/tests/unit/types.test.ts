import { trackOfferStatusSchema } from "../../src/types";

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
});
