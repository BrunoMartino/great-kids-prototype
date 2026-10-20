import { getConnection, queryRaw } from "@/internal/db/connection";

export type FamilyDiaryRecord = {
  id: string;
};

export class FamilyDiary {
  private static _instance: FamilyDiary | null = null;

  private constructor() {}

  public static get instance(): FamilyDiary {
    if (FamilyDiary._instance === null) {
      FamilyDiary._instance = new FamilyDiary();
    }
    return FamilyDiary._instance;
  }

  public insertEmpty(): FamilyDiaryRecord {
    getConnection();
    const id: string = crypto.randomUUID();
    const now: string = new Date().toISOString();
    queryRaw(
      `INSERT INTO family_diary (
        id, family_notes, mission_note, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        JSON.stringify({ id, notes: [] }),
        JSON.stringify({ id, notes: [] }),
        now,
        now,
      ],
    );
    return { id };
  }
}
