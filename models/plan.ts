import { getConnection, queryRaw } from "@/internal/db/connection";

export type PlanRecord = {
  id: string;
  name: string;
  status: string;
};

export class Plan {
  private static _instance: Plan | null = null;

  private constructor() {}

  public static get instance(): Plan {
    if (Plan._instance === null) {
      Plan._instance = new Plan();
    }
    return Plan._instance;
  }

  public findById(p_id: string): PlanRecord | null {
    getConnection();
    const rows: PlanRecord[] = queryRaw<PlanRecord>(
      `SELECT id, name, status FROM plan WHERE id = ?`,
      [p_id],
    );
    const first: PlanRecord | undefined = rows[0];
    return first ?? null;
  }

  public findByName(p_name: string): PlanRecord | null {
    getConnection();
    const rows: PlanRecord[] = queryRaw<PlanRecord>(
      `SELECT id, name, status FROM plan WHERE name = ?`,
      [p_name],
    );
    const first: PlanRecord | undefined = rows[0];
    return first ?? null;
  }

  public findFree(): PlanRecord | null {
    return this.findByName("Free");
  }

  public delete(p_planId: string): void {
    getConnection();
    queryRaw(`DELETE FROM plan WHERE id = ?`, [p_planId]);
  }
}
