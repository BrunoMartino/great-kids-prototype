import { describe, expect, it } from "vitest";

describe("FamilyMissionCycle State", () => {
  it("moves Accepted to Doing", async () => {
    // Break: startDoing leaves Accepted or jumps to Completed.
    const { FamilyMissionCycle } = await import("@/app/api/family-missions/mission-cycle");
    const cycle: { getName: () => string; startDoing: () => void } = new FamilyMissionCycle(
      "Accepted",
    );
    cycle.startDoing();
    expect(cycle.getName()).toBe("Doing");
  });

  it("moves Doing to Completed", async () => {
    // Break: complete from Doing is refused or skips the Completed name.
    const { FamilyMissionCycle } = await import("@/app/api/family-missions/mission-cycle");
    const cycle: { getName: () => string; complete: () => void } = new FamilyMissionCycle(
      "Doing",
    );
    cycle.complete();
    expect(cycle.getName()).toBe("Completed");
  });

  it("rejects complete from Accepted (skip Doing)", async () => {
    // Break: Accepted → Completed is allowed (INV-003 skip).
    const { FamilyMissionCycle } = await import("@/app/api/family-missions/mission-cycle");
    const cycle: { complete: () => void } = new FamilyMissionCycle("Accepted");
    expect(() => {
      cycle.complete();
    }).toThrow();
  });

  it("rejects Completed back to Accepted on the same cycle", async () => {
    // Break: Completed.accept() returns the row to Accepted.
    const { FamilyMissionCycle } = await import("@/app/api/family-missions/mission-cycle");
    const cycle: { accept: () => void } = new FamilyMissionCycle("Completed");
    expect(() => {
      cycle.accept();
    }).toThrow();
  });
});
