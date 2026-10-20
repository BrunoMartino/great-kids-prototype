import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";
import { NOTE_KINDS } from "./helpers";

describe("NoteKindStrategy whitelist", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("accepts the five documented kinds", async () => {
    // Break: a documented kind has no Strategy and is rejected.
    const { resolveNoteKind } = await import(
      "@/app/api/families/[id]/diary/kind-strategy"
    );
    for (const p_kind of NOTE_KINDS) {
      expect(resolveNoteKind(p_kind).kind).toBe(p_kind);
    }
  });

  it("rejects an unknown kind", async () => {
    // Break: garbage kind is treated as a valid Strategy.
    const { resolveNoteKind } = await import(
      "@/app/api/families/[id]/diary/kind-strategy"
    );
    expect(() => resolveNoteKind("milestone")).toThrow();
  });

  it("rejects an empty kind", async () => {
    // Break: empty string is accepted as a kind.
    const { resolveNoteKind } = await import(
      "@/app/api/families/[id]/diary/kind-strategy"
    );
    expect(() => resolveNoteKind("")).toThrow();
  });

  it("rejects an injection-shaped kind as unknown", async () => {
    // Break: SQL-looking kind string is accepted instead of rejected as data.
    const { resolveNoteKind } = await import(
      "@/app/api/families/[id]/diary/kind-strategy"
    );
    expect(() => resolveNoteKind("phrase'; DROP TABLE family_diary;--")).toThrow();
  });
});
