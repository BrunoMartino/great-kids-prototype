import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import {
  arrangeCalendarFamily,
  arrangeDraftMission,
  arrangePublishedMission,
} from "./helpers";

type WeekSuggestion = {
  mission_id: string;
  title: string;
};

describe("WeekListStrategy", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("lists a published catalog mission with its title", async () => {
    // Break: week list includes a draft or invents a title not on the catalog row.
    const arranged = await arrangeCalendarFamily();
    const publishedId: string = await arrangePublishedMission("Park picnic");
    const { WeekListStrategy } = await import(
      "@/app/api/families/[id]/forecast/week-list-strategy"
    );
    const listed: WeekSuggestion[] = new WeekListStrategy().list({
      familyId: arranged.familyId,
    });
    expect(listed).toEqual([{ mission_id: publishedId, title: "Park picnic" }]);
  });

  it("caps the week list at five published missions", async () => {
    // Break: week list is an unbounded dump of every published row.
    const arranged = await arrangeCalendarFamily();
    const titles: string[] = [
      "Walk one",
      "Walk two",
      "Walk three",
      "Walk four",
      "Walk five",
      "Walk six",
      "Walk seven",
    ];
    const publishedIds: string[] = [];
    for (const title of titles) {
      publishedIds.push(await arrangePublishedMission(title));
    }
    const { WeekListStrategy } = await import(
      "@/app/api/families/[id]/forecast/week-list-strategy"
    );
    const listed: WeekSuggestion[] = new WeekListStrategy().list({
      familyId: arranged.familyId,
    });
    expect(listed.length).toBe(5);
    for (const row of listed) {
      expect(publishedIds).toContain(row.mission_id);
    }
  });

  it("omits a draft mission from the week list", async () => {
    // Break: unpublished catalog id is offered as a weekly suggestion (INV-005).
    const arranged = await arrangeCalendarFamily();
    const draftId: string = await arrangeDraftMission("Still a draft");
    const publishedId: string = await arrangePublishedMission("Published picnic");
    const { WeekListStrategy } = await import(
      "@/app/api/families/[id]/forecast/week-list-strategy"
    );
    const listed: WeekSuggestion[] = new WeekListStrategy().list({
      familyId: arranged.familyId,
    });
    const ids: string[] = listed.map((p_row: WeekSuggestion) => p_row.mission_id);
    expect(ids).toContain(publishedId);
    expect(ids).not.toContain(draftId);
  });

  it("treats an injection-shaped family id as data", async () => {
    // Break: concatenated family id throws or lists invented copy.
    await arrangeCalendarFamily();
    const publishedId: string = await arrangePublishedMission("Safe picnic");
    const { WeekListStrategy } = await import(
      "@/app/api/families/[id]/forecast/week-list-strategy"
    );
    const dirtyId: string = "abc' OR '1'='1";
    const listed: WeekSuggestion[] = new WeekListStrategy().list({ familyId: dirtyId });
    expect(listed.every((p_row: WeekSuggestion) => p_row.mission_id === publishedId)).toBe(
      true,
    );
    expect(listed.every((p_row: WeekSuggestion) => p_row.title !== "Invented")).toBe(true);
  });
});
