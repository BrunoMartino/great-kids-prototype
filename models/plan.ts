import { getConnection, queryRaw } from "@/internal/db/connection";

export type PlanRecord = {
  id: string;
  name: string;
  status: string;
};

export class DuplicatePlanNameError extends Error {
  public constructor() {
    super("duplicate plan name");
    this.name = "DuplicatePlanNameError";
  }
}

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

  public list(): PlanRecord[] {
    getConnection();
    return queryRaw<PlanRecord>(`SELECT id, name, status FROM plan ORDER BY name`, []);
  }

  public create(p_name: string, p_status: string): PlanRecord {
    if (p_name.trim() === "") {
      throw new Error("name required");
    }
    if (p_status !== "active" && p_status !== "inactive") {
      throw new Error("invalid status");
    }
    getConnection();
    const id: string = crypto.randomUUID();
    const now: string = new Date().toISOString();
    try {
      queryRaw(`INSERT INTO plan (id, name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`, [
        id,
        p_name,
        p_status,
        now,
        now,
      ]);
    } catch (p_error: unknown) {
      if (p_error instanceof Error && /UNIQUE/i.test(p_error.message)) {
        throw new DuplicatePlanNameError();
      }
      throw p_error;
    }
    return { id, name: p_name, status: p_status };
  }

  public updateStatus(p_planId: string, p_status: string): PlanRecord | null {
    if (p_status !== "active" && p_status !== "inactive") {
      throw new Error("invalid status");
    }
    const current: PlanRecord | null = this.findById(p_planId);
    if (current === null) {
      return null;
    }
    getConnection();
    const now: string = new Date().toISOString();
    queryRaw(`UPDATE plan SET status = ?, updated_at = ? WHERE id = ?`, [p_status, now, p_planId]);
    return this.findById(p_planId);
  }

  public delete(p_planId: string): void {
    getConnection();
    queryRaw(`DELETE FROM plan WHERE id = ?`, [p_planId]);
  }
}
