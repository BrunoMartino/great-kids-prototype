import { getConnection, queryRaw } from "@/internal/db/connection";

type PublishedIdRow = {
  id: string;
};

export class ContextFilterStrategy {
  public publishedMissionIds(p_contextId: string): string[] {
    getConnection();
    const rows: PublishedIdRow[] = queryRaw<PublishedIdRow>(
      `SELECT m.id FROM mission m
       INNER JOIN mission_forecast_context l ON l.mission_id = m.id
       WHERE l.context_id = ?
         AND m.deleted = 0
         AND m.status = 'active'
         AND m.review_status = 'published'`,
      [p_contextId],
    );
    return rows.map((p_row: PublishedIdRow) => p_row.id);
  }
}
