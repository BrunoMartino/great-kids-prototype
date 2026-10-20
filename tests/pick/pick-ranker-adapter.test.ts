import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import { arrangeDraftMission, arrangePickFamily, arrangePublishedMission, UNKNOWN_ID } from "./helpers";

describe("RankerAdapter", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("returns a published catalog id the ranker chose from the candidate set", async () => {
    // Break: Adapter ignores the ranker id that is already in the published set.
    const publishedId: string = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const otherId: string = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
    const { RankerAdapter } = await import("@/services/mission_pick/ranker-adapter");
    const adapter: InstanceType<typeof RankerAdapter> = new RankerAdapter(
      (p_ids: string[]): string => otherId,
    );
    expect(adapter.rank([publishedId, otherId])).toBe(otherId);
  });

  it("discards free-text ranker output", async () => {
    // Break: invented prose is accepted as a mission id (INV-001).
    const { RankerAdapter, RankerDiscardError } = await import(
      "@/services/mission_pick/ranker-adapter"
    );
    const adapter: InstanceType<typeof RankerAdapter> = new RankerAdapter(
      (): string => "Let's go fly a kite in the park",
    );
    expect(() => {
      adapter.rank(["aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"]);
    }).toThrow(RankerDiscardError);
  });

  it("discards an unknown id that is not in the candidate set", async () => {
    // Break: ranker uuid that is not in mission is returned.
    const { RankerAdapter, RankerDiscardError } = await import(
      "@/services/mission_pick/ranker-adapter"
    );
    const adapter: InstanceType<typeof RankerAdapter> = new RankerAdapter(
      (): string => UNKNOWN_ID,
    );
    expect(() => {
      adapter.rank(["aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"]);
    }).toThrow(RankerDiscardError);
  });

  it("rejects a draft id even if a leaky ranker returns it", async () => {
    // Break: unpublished id from the ranker is trusted (INV-005).
    const arranged = await arrangePickFamily();
    const publishedId: string = await arrangePublishedMission("Trusted walk");
    const draftId: string = await arrangeDraftMission("Leaky draft");
    const { RankerAdapter } = await import("@/services/mission_pick/ranker-adapter");
    const { MissionPick } = await import("@/services/mission_pick/mission-pick");
    const { PickStrategy } = await import("@/services/mission_pick/pick-strategy");
    class LeakyPickStrategy extends PickStrategy {
      public filter(): Array<{ id: string }> {
        return [{ id: draftId }];
      }
    }
    const pick: InstanceType<typeof MissionPick> = new MissionPick(
      new LeakyPickStrategy(),
      new RankerAdapter((): string => draftId),
    );
    expect(() => {
      pick.pick({ familyId: arranged.familyId });
    }).toThrow();
    const { Mission } = await import("@/models/mission");
    expect(Mission.instance.findById(publishedId)?.review_status).toBe("published");
  });
});
