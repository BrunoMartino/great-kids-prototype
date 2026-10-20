import { describe, expect, it } from "vitest";

describe("ReviewState", () => {
  it("allows draft to in_review to published and returns the to-status", async () => {
    // Break: legal forward transitions throw or return the from-status.
    const { ReviewState } = await import("@/app/api/missions/[id]/review-state");
    expect(ReviewState.transition("draft", "in_review")).toBe("in_review");
    expect(ReviewState.transition("in_review", "published")).toBe("published");
  });

  it("allows published to in_review for re-review", async () => {
    // Break: re-review from published is rejected.
    const { ReviewState } = await import("@/app/api/missions/[id]/review-state");
    expect(ReviewState.transition("published", "in_review")).toBe("in_review");
  });

  it("throws on published to draft", async () => {
    // Break: published skips in_review back to draft.
    const { ReviewState } = await import("@/app/api/missions/[id]/review-state");
    expect(() => {
      ReviewState.transition("published", "draft");
    }).toThrow();
  });

  it("throws on draft to published", async () => {
    // Break: INV-005 — draft publishes without in_review.
    const { ReviewState } = await import("@/app/api/missions/[id]/review-state");
    expect(() => {
      ReviewState.transition("draft", "published");
    }).toThrow();
  });
});
