export type WeekSuggestionItem = {
  mission_id: string;
  title: string;
};

export type WeekSuggestionEnvelope = {
  id: string;
  suggestions: WeekSuggestionItem[];
};

export const WEEK_LIST_CAP: number = 5;

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

export function readWeekEnvelope(p_value: unknown): WeekSuggestionEnvelope | null {
  if (!isRecord(p_value) || typeof p_value.id !== "string") {
    return null;
  }
  if (!Array.isArray(p_value.suggestions)) {
    return null;
  }
  const suggestions: WeekSuggestionItem[] = [];
  for (const p_item of p_value.suggestions) {
    if (!isRecord(p_item)) {
      return null;
    }
    if (typeof p_item.mission_id !== "string" || p_item.mission_id.length === 0) {
      return null;
    }
    if (typeof p_item.title !== "string") {
      return null;
    }
    suggestions.push({ mission_id: p_item.mission_id, title: p_item.title });
    if (suggestions.length >= WEEK_LIST_CAP) {
      break;
    }
  }
  return { id: p_value.id, suggestions };
}
