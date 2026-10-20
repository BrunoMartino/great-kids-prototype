import { ContextFilterStrategy } from "@/app/api/forecast-contexts/context-filter-strategy";
import { getConnection, queryRaw } from "@/internal/db/connection";
import { FamilyProfile } from "@/models/family_profile";
import {
  PickStrategy,
  type PickCandidate,
  type PickFilterInput,
} from "@/services/mission_pick/pick-strategy";

type MissionPickRow = {
  id: string;
  title: string;
  age_min: number | null;
  age_max: number | null;
  repeatable: number;
  values: string;
};

type HistoryRow = {
  mission_id: string;
};

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

function parseValues(p_json: string): string[] {
  const parsed: unknown = JSON.parse(p_json);
  if (!isRecord(parsed) || !Array.isArray(parsed.values)) {
    return [];
  }
  return parsed.values.filter((p_item: unknown): p_item is string => typeof p_item === "string");
}

function agesFromAnswers(p_texts: string[]): number[] {
  const ages: number[] = [];
  for (const text of p_texts) {
    if (!/^\d{1,2}$/.test(text)) {
      continue;
    }
    const age: number = Number(text);
    if (age >= 0 && age <= 18) {
      ages.push(age);
    }
  }
  return ages;
}

function ageMatches(p_candidate: PickCandidate, p_ages: number[]): boolean {
  if (p_ages.length === 0) {
    return true;
  }
  if (p_candidate.age_min === null && p_candidate.age_max === null) {
    return true;
  }
  const minAge: number = p_candidate.age_min ?? 0;
  const maxAge: number = p_candidate.age_max ?? 99;
  return p_ages.some((p_age: number) => p_age >= minAge && p_age <= maxAge);
}

function scoreCandidate(p_candidate: PickCandidate, p_answers: string[]): number {
  let points: number = 0;
  const haystack: string = `${p_candidate.title ?? ""} ${(p_candidate.values ?? []).join(" ")}`.toLowerCase();
  for (const answer of p_answers) {
    const needle: string = answer.trim().toLowerCase();
    if (needle !== "" && haystack.includes(needle)) {
      points += 1;
    }
  }
  return points;
}

export class CatalogPickStrategy extends PickStrategy {
  public filter(p_input: PickFilterInput): PickCandidate[] {
    getConnection();
    const rows: MissionPickRow[] = queryRaw<MissionPickRow>(
      `SELECT id, title, age_min, age_max, repeatable, "values"
       FROM mission
       WHERE deleted = 0 AND status = 'active' AND review_status = 'published'`,
      [],
    );
    let candidates: PickCandidate[] = rows.map((p_row: MissionPickRow) => ({
      id: p_row.id,
      title: p_row.title,
      age_min: p_row.age_min,
      age_max: p_row.age_max,
      repeatable: p_row.repeatable,
      values: parseValues(p_row.values),
    }));
    if (p_input.contextId !== undefined && p_input.contextId !== "") {
      const tagged: string[] = new ContextFilterStrategy().publishedMissionIds(p_input.contextId);
      const taggedSet: Set<string> = new Set(tagged);
      candidates = candidates.filter((p_row: PickCandidate) => taggedSet.has(p_row.id));
    }
    const skipped: HistoryRow[] = queryRaw<HistoryRow>(
      `SELECT fm.mission_id
       FROM family_mission fm
       INNER JOIN mission m ON m.id = fm.mission_id
       WHERE fm.fam_id = ?
         AND fm.status = 'Completed'
         AND m.repeatable = 0`,
      [p_input.familyId],
    );
    const skippedSet: Set<string> = new Set(
      skipped.map((p_row: HistoryRow) => p_row.mission_id),
    );
    candidates = candidates.filter((p_row: PickCandidate) => !skippedSet.has(p_row.id));
    const liveTexts: string[] = FamilyProfile.instance
      .liveAnswers(p_input.familyId)
      .map((p_item: { answer_text: string }) => p_item.answer_text);
    const ages: number[] = p_input.ages ?? agesFromAnswers(liveTexts);
    candidates = candidates.filter((p_row: PickCandidate) => ageMatches(p_row, ages));
    const scored: Array<{ candidate: PickCandidate; score: number }> = candidates.map(
      (p_row: PickCandidate) => ({
        candidate: p_row,
        score: scoreCandidate(p_row, liveTexts),
      }),
    );
    scored.sort((p_left: { candidate: PickCandidate; score: number }, p_right: {
      candidate: PickCandidate;
      score: number;
    }) => {
      if (p_right.score !== p_left.score) {
        return p_right.score - p_left.score;
      }
      return p_left.candidate.id.localeCompare(p_right.candidate.id);
    });
    return scored.map((p_row: { candidate: PickCandidate; score: number }) => p_row.candidate);
  }
}
