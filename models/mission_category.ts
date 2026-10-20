import { getConnection, queryRaw } from "@/internal/db/connection";

export type MissionCategoryRecord = {
  id: string;
  slug: string;
  name: string;
};

export type MissionCategoryCreateInput = {
  slug: string;
  name: string;
};

export class DuplicateSlugError extends Error {
  public constructor() {
    super("duplicate slug");
    this.name = "DuplicateSlugError";
  }
}

export class MissionCategory {
  private static _instance: MissionCategory | null = null;

  private constructor() {}

  public static get instance(): MissionCategory {
    if (MissionCategory._instance === null) {
      MissionCategory._instance = new MissionCategory();
    }
    return MissionCategory._instance;
  }

  public list(): MissionCategoryRecord[] {
    getConnection();
    return queryRaw<MissionCategoryRecord>(
      "SELECT id, slug, name FROM mission_category ORDER BY slug",
      [],
    );
  }

  public findById(p_id: string): MissionCategoryRecord | null {
    getConnection();
    const rows: MissionCategoryRecord[] = queryRaw<MissionCategoryRecord>(
      "SELECT id, slug, name FROM mission_category WHERE id = ?",
      [p_id],
    );
    const first: MissionCategoryRecord | undefined = rows[0];
    return first ?? null;
  }

  public create(p_input: MissionCategoryCreateInput): MissionCategoryRecord {
    getConnection();
    const id: string = crypto.randomUUID();
    const now: string = new Date().toISOString();
    try {
      queryRaw(
        `INSERT INTO mission_category (id, slug, name, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, p_input.slug, p_input.name, now, now],
      );
    } catch (p_error: unknown) {
      if (p_error instanceof Error && /UNIQUE/i.test(p_error.message)) {
        throw new DuplicateSlugError();
      }
      throw p_error;
    }
    return { id, slug: p_input.slug, name: p_input.name };
  }
}
