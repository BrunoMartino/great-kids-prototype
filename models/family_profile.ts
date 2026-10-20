import { getConnection, queryRaw } from "@/internal/db/connection";

export type FamilyProfileRecord = {
  id: string;
};

export class FamilyProfile {
  private static _instance: FamilyProfile | null = null;

  private constructor() {}

  public static get instance(): FamilyProfile {
    if (FamilyProfile._instance === null) {
      FamilyProfile._instance = new FamilyProfile();
    }
    return FamilyProfile._instance;
  }

  public insertEmpty(): FamilyProfileRecord {
    getConnection();
    const id: string = crypto.randomUUID();
    const now: string = new Date().toISOString();
    queryRaw(
      `INSERT INTO family_profile (
        id, quiz_answer, rhythms, achievements, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        JSON.stringify({ id, quiz_answer: [] }),
        JSON.stringify({ id, rhythms: [] }),
        JSON.stringify({ id, achievements: [] }),
        now,
        now,
      ],
    );
    return { id };
  }
}
