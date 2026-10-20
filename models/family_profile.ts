import { getConnection, queryRaw } from "@/internal/db/connection";

export type FamilyProfileRecord = {
  id: string;
};

export type QuizAnswerItem = {
  question_id: string;
  answer_text: string;
  deleted: boolean;
};

export type QuizAnswerEnvelope = {
  id: string;
  answers: QuizAnswerItem[];
};

export type RhythmsEnvelope = {
  id: string;
  rhythms: unknown[];
};

export type AchievementsEnvelope = {
  id: string;
  achievements: unknown[];
};

export type GpsDocument = {
  id: string;
  quiz_answer: QuizAnswerEnvelope;
  rhythms: RhythmsEnvelope;
  achievements: AchievementsEnvelope;
  profile_notes: string | null;
};

type ProfileRow = {
  id: string;
  quiz_answer: string;
  rhythms: string;
  achievements: string;
  profile_notes: string | null;
  deleted: number;
};

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

function parseAnswerItem(p_value: unknown): QuizAnswerItem {
  if (!isRecord(p_value)) {
    throw new Error("invalid answer");
  }
  if (typeof p_value.question_id !== "string" || typeof p_value.answer_text !== "string") {
    throw new Error("invalid answer");
  }
  return {
    question_id: p_value.question_id,
    answer_text: p_value.answer_text,
    deleted: p_value.deleted === true,
  };
}

export function parseQuizAnswerEnvelope(p_json: string): QuizAnswerEnvelope {
  const parsed: unknown = JSON.parse(p_json);
  if (Array.isArray(parsed)) {
    throw new Error("quiz_answer must be an envelope");
  }
  if (!isRecord(parsed) || typeof parsed.id !== "string") {
    throw new Error("quiz_answer must be an envelope");
  }
  if (Array.isArray(parsed.answers)) {
    return {
      id: parsed.id,
      answers: parsed.answers.map(parseAnswerItem),
    };
  }
  if (Array.isArray(parsed.quiz_answer)) {
    return {
      id: parsed.id,
      answers: parsed.quiz_answer.map((p_item: unknown) => {
        if (isRecord(p_item) && typeof p_item.question_id === "string") {
          return parseAnswerItem(p_item);
        }
        return null;
      }).filter((p_item: QuizAnswerItem | null): p_item is QuizAnswerItem => p_item !== null),
    };
  }
  throw new Error("quiz_answer must be an envelope");
}

function parseKeyedEnvelope(p_json: string, p_key: "rhythms" | "achievements"): {
  id: string;
  items: unknown[];
} {
  const parsed: unknown = JSON.parse(p_json);
  if (Array.isArray(parsed)) {
    throw new Error(`${p_key} must be an envelope`);
  }
  if (!isRecord(parsed) || typeof parsed.id !== "string" || !Array.isArray(parsed[p_key])) {
    throw new Error(`${p_key} must be an envelope`);
  }
  return { id: parsed.id, items: parsed[p_key] };
}

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

  public findByFamilyId(p_familyId: string): GpsDocument | null {
    getConnection();
    const rows: ProfileRow[] = queryRaw<ProfileRow>(
      `SELECT fp.id, fp.quiz_answer, fp.rhythms, fp.achievements, fp.profile_notes, fp.deleted
       FROM family_profile fp
       INNER JOIN family f ON f.fam_profile_id = fp.id
       WHERE f.id = ?`,
      [p_familyId],
    );
    const row: ProfileRow | undefined = rows[0];
    if (row === undefined) {
      return null;
    }
    const quiz: QuizAnswerEnvelope = parseQuizAnswerEnvelope(row.quiz_answer);
    const rhythmsParsed = parseKeyedEnvelope(row.rhythms, "rhythms");
    const achievementsParsed = parseKeyedEnvelope(row.achievements, "achievements");
    return {
      id: row.id,
      quiz_answer: quiz,
      rhythms: { id: rhythmsParsed.id, rhythms: rhythmsParsed.items },
      achievements: { id: achievementsParsed.id, achievements: achievementsParsed.items },
      profile_notes: row.profile_notes,
    };
  }

  public appendAnswer(p_familyId: string, p_item: QuizAnswerItem): QuizAnswerEnvelope {
    const current: GpsDocument | null = this.findByFamilyId(p_familyId);
    if (current === null) {
      throw new Error("profile not found");
    }
    const next: QuizAnswerEnvelope = {
      id: current.quiz_answer.id,
      answers: [...current.quiz_answer.answers, p_item],
    };
    this.persistAnswers(current.id, next);
    return next;
  }

  public replaceAnswers(p_familyId: string, p_envelope: QuizAnswerEnvelope): QuizAnswerEnvelope {
    const current: GpsDocument | null = this.findByFamilyId(p_familyId);
    if (current === null) {
      throw new Error("profile not found");
    }
    this.persistAnswers(current.id, p_envelope);
    return p_envelope;
  }

  public liveAnswers(p_familyId: string): QuizAnswerItem[] {
    const current: GpsDocument | null = this.findByFamilyId(p_familyId);
    if (current === null) {
      return [];
    }
    return current.quiz_answer.answers.filter((p_item: QuizAnswerItem) => p_item.deleted === false);
  }

  private persistAnswers(p_profileId: string, p_envelope: QuizAnswerEnvelope): void {
    getConnection();
    const now: string = new Date().toISOString();
    queryRaw(`UPDATE family_profile SET quiz_answer = ?, updated_at = ? WHERE id = ?`, [
      JSON.stringify(p_envelope),
      now,
      p_profileId,
    ]);
  }
}
