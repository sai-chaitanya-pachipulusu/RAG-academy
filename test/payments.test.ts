import { describe, it, expect } from "vitest";
import { verifyPolarWebhookSignature, TEST_CARDS } from "@/lib/payments/polar";

describe("Polar Payments", () => {
  describe("verifyPolarWebhookSignature", () => {
    it("should return false when signature is empty", () => {
      expect(verifyPolarWebhookSignature("payload", "", "secret")).toBe(false);
    });

    it("should return false when secret is empty", () => {
      expect(verifyPolarWebhookSignature("payload", "sig", "")).toBe(false);
    });
  });

  describe("TEST_CARDS", () => {
    it("should have success card", () => {
      expect(TEST_CARDS.success.number).toBe("4242 4242 4242 4242");
    });

    it("should have declined card", () => {
      expect(TEST_CARDS.declined.number).toBe("4000 0000 0000 0002");
    });
  });
});
