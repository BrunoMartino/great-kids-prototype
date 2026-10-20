import { getConnection, queryRaw } from "@/internal/db/connection";

export type ForecastContextRecord = {
  id: string;
  slug: string;
  name: string;
};

export class ForecastContext {
  private static _instance: ForecastContext | null = null;

  private constructor() {}

  public static get instance(): ForecastContext {
    if (ForecastContext._instance === null) {
      ForecastContext._instance = new ForecastContext();
    }
    return ForecastContext._instance;
  }

  public list(): ForecastContextRecord[] {
    getConnection();
    return queryRaw<ForecastContextRecord>(
      "SELECT id, slug, name FROM forecast_context ORDER BY slug",
      [],
    );
  }

  public findById(p_id: string): ForecastContextRecord | null {
    getConnection();
    const rows: ForecastContextRecord[] = queryRaw<ForecastContextRecord>(
      "SELECT id, slug, name FROM forecast_context WHERE id = ?",
      [p_id],
    );
    const first: ForecastContextRecord | undefined = rows[0];
    return first ?? null;
  }

  public findBySlug(p_slug: string): ForecastContextRecord | null {
    getConnection();
    const rows: ForecastContextRecord[] = queryRaw<ForecastContextRecord>(
      "SELECT id, slug, name FROM forecast_context WHERE slug = ?",
      [p_slug],
    );
    const first: ForecastContextRecord | undefined = rows[0];
    return first ?? null;
  }

  public updateName(p_id: string, p_name: string): ForecastContextRecord | null {
    if (p_name.trim() === "") {
      throw new Error("name required");
    }
    const current: ForecastContextRecord | null = this.findById(p_id);
    if (current === null) {
      return null;
    }
    getConnection();
    const now: string = new Date().toISOString();
    queryRaw(`UPDATE forecast_context SET name = ?, updated_at = ? WHERE id = ?`, [
      p_name,
      now,
      p_id,
    ]);
    return this.findById(p_id);
  }
}
