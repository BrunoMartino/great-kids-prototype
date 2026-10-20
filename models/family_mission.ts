import { getConnection, queryRaw } from "@/internal/db/connection";

export type FamilyMissionRow = {
  id: string;
  fam_id: string;
  mission_id: string;
  status: string;
  accepted_at: string | null;
  completed_at: string | null;
  closing: string | null;
  title: string | null;
};

export type FamilyMissionClosing = {
  do_again: boolean;
  save_memory: boolean;
};

type CountRow = {
  n: number;
};

type TitleRow = {
  title: string;
};

type RepeatableRow = {
  repeatable: number;
};

type ColumnRow = {
  name: string;
};

export class FamilyMission {
  private static _instance: FamilyMission | null = null;

  private constructor() {}

  public static get instance(): FamilyMission {
    if (FamilyMission._instance === null) {
      FamilyMission._instance = new FamilyMission();
    }
    return FamilyMission._instance;
  }

  public ensureTitleColumn(): void {
    getConnection();
    const columns: ColumnRow[] = queryRaw<ColumnRow>("PRAGMA table_info(family_mission)", []);
    const hasTitle: boolean = columns.some((p_column: ColumnRow) => p_column.name === "title");
    if (hasTitle) {
      return;
    }
    queryRaw("ALTER TABLE family_mission ADD COLUMN title TEXT", []);
  }

  public insertAccepted(p_famId: string, p_missionId: string): FamilyMissionRow {
    this.ensureTitleColumn();
    const id: string = crypto.randomUUID();
    const now: string = new Date().toISOString();
    const title: string = this.snapshotTitle(p_missionId);
    queryRaw(
      `INSERT INTO family_mission (
        id, fam_id, mission_id, status, accepted_at, completed_at, closing, title, created_at, updated_at
      ) VALUES (?, ?, ?, 'Accepted', ?, NULL, NULL, ?, ?, ?)`,
      [id, p_famId, p_missionId, now, title, now, now],
    );
    const stored: FamilyMissionRow | null = this.findById(id);
    if (stored === null) {
      throw new Error("family_mission insert failed");
    }
    return stored;
  }

  public findById(p_id: string): FamilyMissionRow | null {
    this.ensureTitleColumn();
    const rows: FamilyMissionRow[] = queryRaw<FamilyMissionRow>(
      `SELECT id, fam_id, mission_id, status, accepted_at, completed_at, closing, title
       FROM family_mission WHERE id = ?`,
      [p_id],
    );
    const first: FamilyMissionRow | undefined = rows[0];
    return first ?? null;
  }

  public updateStatus(p_id: string, p_status: string): void {
    this.ensureTitleColumn();
    const now: string = new Date().toISOString();
    queryRaw(`UPDATE family_mission SET status = ?, updated_at = ? WHERE id = ?`, [
      p_status,
      now,
      p_id,
    ]);
  }

  public completeWithClosing(
    p_id: string,
    p_closing: FamilyMissionClosing,
    p_title: string,
    p_completedAt: string,
  ): void {
    this.ensureTitleColumn();
    queryRaw(
      `UPDATE family_mission
       SET status = 'Completed', closing = ?, title = ?, completed_at = ?, updated_at = ?
       WHERE id = ?`,
      [JSON.stringify(p_closing), p_title, p_completedAt, p_completedAt, p_id],
    );
  }

  public listCompleted(p_famId: string): FamilyMissionRow[] {
    this.ensureTitleColumn();
    return queryRaw<FamilyMissionRow>(
      `SELECT id, fam_id, mission_id, status, accepted_at, completed_at, closing, title
       FROM family_mission
       WHERE fam_id = ? AND status = 'Completed'
       ORDER BY completed_at ASC, id ASC`,
      [p_famId],
    );
  }

  public countCompleted(p_famId: string, p_missionId: string): number {
    getConnection();
    const rows: CountRow[] = queryRaw<CountRow>(
      `SELECT COUNT(*) AS n FROM family_mission
       WHERE fam_id = ? AND mission_id = ? AND status = 'Completed'`,
      [p_famId, p_missionId],
    );
    const first: CountRow | undefined = rows[0];
    return first?.n ?? 0;
  }

  public isRepeatable(p_missionId: string): boolean {
    getConnection();
    const rows: RepeatableRow[] = queryRaw<RepeatableRow>(
      `SELECT repeatable FROM mission WHERE id = ?`,
      [p_missionId],
    );
    const first: RepeatableRow | undefined = rows[0];
    return first?.repeatable === 1;
  }

  public snapshotTitle(p_missionId: string): string {
    getConnection();
    const rows: TitleRow[] = queryRaw<TitleRow>(`SELECT title FROM mission WHERE id = ?`, [
      p_missionId,
    ]);
    const first: TitleRow | undefined = rows[0];
    return first?.title ?? "";
  }
}
