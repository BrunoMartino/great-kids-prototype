import { describe, expect, it } from "vitest";

const VALUES_ID: string = "c0ffee00-0000-4000-8000-000000000001";

type FicheBuildInput = {
  description?: string;
  img_path?: string;
  duration_minutes?: number;
  age_min?: number;
  age_max?: number;
  setting?: string;
  values?: { id: string; values: string[] } | string[];
};

type FicheBuilt = {
  title?: string | null;
  description?: string | null;
  img_path?: string | null;
  duration_minutes?: number | null;
  age_min?: number | null;
  age_max?: number | null;
  setting?: string | null;
  values?: { id: string; values: string[] } | null;
};

describe("FicheBuilder", () => {
  it("merges optional fiche fields from p_input", async () => {
    // Break: Builder drops fields or invents a different img_path/values shape.
    const { FicheBuilder } = await import("@/app/api/missions/[id]/fiche-builder");
    const p_input: FicheBuildInput = {
      description: "Fold paper",
      img_path: "missions/boats.jpg",
      duration_minutes: 15,
      age_min: 5,
      age_max: 10,
      setting: "Indoor",
      values: { id: VALUES_ID, values: ["patience"] },
    };
    const built: FicheBuilt = FicheBuilder.build(p_input) as FicheBuilt;
    expect(built.description).toBe("Fold paper");
    expect(built.img_path).toBe("missions/boats.jpg");
    expect(built.duration_minutes).toBe(15);
    expect(built.age_min).toBe(5);
    expect(built.age_max).toBe(10);
    expect(built.setting).toBe("Indoor");
    expect(built.values).toEqual({ id: VALUES_ID, values: ["patience"] });
  });

  it("leaves omitted optional fields undefined or null and does not invent a title", async () => {
    // Break: omitted fields filled with invented title or defaults.
    const { FicheBuilder } = await import("@/app/api/missions/[id]/fiche-builder");
    const p_input: FicheBuildInput = {
      setting: "Indoor",
    };
    const built: FicheBuilt = FicheBuilder.build(p_input) as FicheBuilt;
    expect(built.setting).toBe("Indoor");
    expect(built.description == null).toBe(true);
    expect(built.img_path == null).toBe(true);
    expect(built.duration_minutes == null).toBe(true);
    expect(built.age_min == null).toBe(true);
    expect(built.age_max == null).toBe(true);
    expect(built.values == null).toBe(true);
    expect(built.title == null).toBe(true);
  });

  it("throws when age_min is greater than age_max", async () => {
    // Break: inverted ages accepted.
    const { FicheBuilder } = await import("@/app/api/missions/[id]/fiche-builder");
    const p_input: FicheBuildInput = {
      age_min: 10,
      age_max: 5,
    };
    expect(() => {
      FicheBuilder.build(p_input);
    }).toThrow();
  });

  it("throws when values is a bare array", async () => {
    // Break: INV-004 — bare [] stored as values.
    const { FicheBuilder } = await import("@/app/api/missions/[id]/fiche-builder");
    const p_input: FicheBuildInput = {
      values: [],
    };
    expect(() => {
      FicheBuilder.build(p_input);
    }).toThrow();
  });
});
