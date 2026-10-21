"use client";

import { useEffect, useState } from "react";
import { readDayDocument } from "../calendar/schedule-on-day-command";
import type { DayDocument, SuggestionItem } from "../calendar/day-composite";
import { readDiaryPayload, type DiaryPayload } from "../diary/diary-payload";
import { readCompletedEnvelope, type CompletedEnvelope } from "../missions/completed/completed-payload";

/** Daily summary of the Parent home, read from the existing family GET endpoints only. */
export type FamilySummary = {
  isLoading: boolean;
  /** Missions placed on today's calendar day (null when the source is unavailable). */
  plannedToday: SuggestionItem[] | null;
  completedCount: number | null;
  quizCount: number | null;
  diaryCount: number | null;
};

const EMPTY_SUMMARY: FamilySummary = {
  isLoading: true,
  plannedToday: null,
  completedCount: null,
  quizCount: null,
  diaryCount: null,
};

function todayStamp(): string {
  const now: Date = new Date();
  const month: string = String(now.getMonth() + 1).padStart(2, "0");
  const day: string = String(now.getDate()).padStart(2, "0");
  return `${String(now.getFullYear())}-${month}-${day}`;
}

async function getJson(p_url: string, p_signal: AbortSignal): Promise<unknown> {
  const response: Response = await fetch(p_url, { cache: "no-store", signal: p_signal });
  if (!response.ok) {
    throw new Error(`summary source failed:${String(response.status)}`);
  }
  return response.json();
}

function settled<T>(p_result: PromiseSettledResult<T | null>): T | null {
  return p_result.status === "fulfilled" ? p_result.value : null;
}

function countQuestions(p_value: unknown): number | null {
  if (p_value === null || typeof p_value !== "object") {
    return null;
  }
  const questions: unknown = Reflect.get(p_value, "questions");
  return Array.isArray(questions) ? questions.length : null;
}

export function useFamilySummary(p_familyId: string, p_isEnabled: boolean): FamilySummary {
  const [summary, setSummary] = useState<FamilySummary>(EMPTY_SUMMARY);

  useEffect(() => {
    if (!p_isEnabled || p_familyId.trim().length === 0) {
      return undefined;
    }
    const controller: AbortController = new AbortController();
    const base: string = `/api/families/${encodeURIComponent(p_familyId)}`;

    const load = async (): Promise<void> => {
      const [day, completed, quiz, diary] = await Promise.allSettled([
        getJson(`${base}/calendar/${encodeURIComponent(todayStamp())}`, controller.signal).then(
          (p_body: unknown): DayDocument | null => readDayDocument(p_body),
        ),
        getJson(`${base}/missions?status=Completed`, controller.signal).then(
          (p_body: unknown): CompletedEnvelope | null => readCompletedEnvelope(p_body),
        ),
        getJson(`${base}/quiz`, controller.signal).then(
          (p_body: unknown): number | null => countQuestions(p_body),
        ),
        getJson(`${base}/diary`, controller.signal).then(
          (p_body: unknown): DiaryPayload | null => readDiaryPayload(p_body),
        ),
      ]);
      if (controller.signal.aborted) {
        return;
      }
      const dayDocument: DayDocument | null = settled(day);
      const completedEnvelope: CompletedEnvelope | null = settled(completed);
      const diaryPayload: DiaryPayload | null = settled(diary);
      setSummary({
        isLoading: false,
        plannedToday: dayDocument === null ? null : dayDocument.suggestions.suggestions,
        completedCount: completedEnvelope === null ? null : completedEnvelope.missions.length,
        quizCount: settled(quiz),
        diaryCount:
          diaryPayload === null
            ? null
            : diaryPayload.family_notes.notes.length + diaryPayload.mission_note.notes.length,
      });
    };

    void load();
    return (): void => {
      controller.abort();
    };
  }, [p_familyId, p_isEnabled]);

  return summary;
}
