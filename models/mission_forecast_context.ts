import { getConnection, queryRaw } from "@/internal/db/connection";
import { ForecastContext } from "@/models/forecast_context";

export class DuplicateContextPairError extends Error {
  public constructor() {
    super("duplicate mission context pair");
    this.name = "DuplicateContextPairError";
  }
}

export class UnknownContextError extends Error {
  public constructor() {
    super("unknown forecast context");
    this.name = "UnknownContextError";
  }
}

export class MissionForecastContext {
  private static _instance: MissionForecastContext | null = null;

  private constructor() {}

  public static get instance(): MissionForecastContext {
    if (MissionForecastContext._instance === null) {
      MissionForecastContext._instance = new MissionForecastContext();
    }
    return MissionForecastContext._instance;
  }

  public replaceSet(p_missionId: string, p_contextIds: string[]): void {
    const uniqueIds: Set<string> = new Set(p_contextIds);
    if (uniqueIds.size !== p_contextIds.length) {
      throw new DuplicateContextPairError();
    }
    for (const contextId of p_contextIds) {
      if (ForecastContext.instance.findById(contextId) === null) {
        throw new UnknownContextError();
      }
    }
    getConnection();
    queryRaw("DELETE FROM mission_forecast_context WHERE mission_id = ?", [p_missionId]);
    for (const contextId of p_contextIds) {
      const id: string = crypto.randomUUID();
      queryRaw(
        `INSERT INTO mission_forecast_context (id, mission_id, context_id)
         VALUES (?, ?, ?)`,
        [id, p_missionId, contextId],
      );
    }
  }

  public listContextIds(p_missionId: string): string[] {
    getConnection();
    const rows: Array<{ context_id: string }> = queryRaw<{ context_id: string }>(
      "SELECT context_id FROM mission_forecast_context WHERE mission_id = ?",
      [p_missionId],
    );
    return rows.map((p_row: { context_id: string }) => p_row.context_id);
  }
}
