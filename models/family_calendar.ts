import { getConnection, queryRaw } from "@/internal/db/connection";

export type FamilyCalendarRow = {
  id: string;
  family_id: string;
  day: string;
  previous_weather: string | null;
  notifications: number;
  suggestions: string;
};

export class UniqueDayError extends Error {
  public constructor() {
    super("unique family_id day");
    this.name = "UniqueDayError";
  }
}

export type FamilyCalendarInsert = {
  family_id: string;
  day: string;
  previous_weather: string | null;
  notifications: number;
  suggestions: string;
};

function isUniqueConstraint(p_error: unknown): boolean {
  if (typeof p_error !== "object" || p_error === null) {
    return false;
  }
  const code: unknown = "code" in p_error ? p_error.code : undefined;
  const message: unknown = "message" in p_error ? p_error.message : undefined;
  if (code === "SQLITE_CONSTRAINT_UNIQUE") {
    return true;
  }
  return typeof message === "string" && message.toUpperCase().includes("UNIQUE");
}

export class FamilyCalendar {
  private static _instance: FamilyCalendar | null = null;

  private constructor() {}

  public static get instance(): FamilyCalendar {
    if (FamilyCalendar._instance === null) {
      FamilyCalendar._instance = new FamilyCalendar();
    }
    return FamilyCalendar._instance;
  }

  public insert(p_input: FamilyCalendarInsert): FamilyCalendarRow {
    getConnection();
    const id: string = crypto.randomUUID();
    const now: string = new Date().toISOString();
    try {
      queryRaw(
        `INSERT INTO family_calendar (
          id, family_id, day, previous_weather, notifications, suggestions, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          p_input.family_id,
          p_input.day,
          p_input.previous_weather,
          p_input.notifications,
          p_input.suggestions,
          now,
          now,
        ],
      );
    } catch (p_error: unknown) {
      if (isUniqueConstraint(p_error)) {
        throw new UniqueDayError();
      }
      throw p_error;
    }
    const stored: FamilyCalendarRow | null = this.findByFamilyDay(p_input.family_id, p_input.day);
    if (stored === null) {
      throw new Error("calendar insert failed");
    }
    return stored;
  }

  public findByFamilyDay(p_familyId: string, p_day: string): FamilyCalendarRow | null {
    getConnection();
    const rows: FamilyCalendarRow[] = queryRaw<FamilyCalendarRow>(
      `SELECT id, family_id, day, previous_weather, notifications, suggestions
       FROM family_calendar WHERE family_id = ? AND day = ?`,
      [p_familyId, p_day],
    );
    const first: FamilyCalendarRow | undefined = rows[0];
    return first ?? null;
  }

  public replaceSuggestions(p_id: string, p_suggestions: string): void {
    getConnection();
    const now: string = new Date().toISOString();
    queryRaw(`UPDATE family_calendar SET suggestions = ?, updated_at = ? WHERE id = ?`, [
      p_suggestions,
      now,
      p_id,
    ]);
  }

  public listByFamily(p_familyId: string): FamilyCalendarRow[] {
    getConnection();
    return queryRaw<FamilyCalendarRow>(
      `SELECT id, family_id, day, previous_weather, notifications, suggestions
       FROM family_calendar WHERE family_id = ?`,
      [p_familyId],
    );
  }
}
