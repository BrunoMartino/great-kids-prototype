export type CompletedClosing = {
  do_again: boolean;
  save_memory: boolean;
};

export type CompletedMissionItem = {
  id: string;
  mission_id: string;
  status: "Completed";
  title: string;
  completed_at: string | null;
  closing: CompletedClosing | null;
};

export type CompletedEnvelope = {
  id: string;
  missions: CompletedMissionItem[];
};

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

function readClosing(p_value: unknown): CompletedClosing | null {
  if (p_value === null) {
    return null;
  }
  if (!isRecord(p_value)) {
    return null;
  }
  if (typeof p_value.do_again !== "boolean") {
    return null;
  }
  if (typeof p_value.save_memory !== "boolean") {
    return null;
  }
  return { do_again: p_value.do_again, save_memory: p_value.save_memory };
}

function readItem(p_value: unknown): CompletedMissionItem | null {
  if (!isRecord(p_value) || typeof p_value.id !== "string") {
    return null;
  }
  if (typeof p_value.mission_id !== "string") {
    return null;
  }
  if (p_value.status !== "Completed") {
    return null;
  }
  if (typeof p_value.title !== "string") {
    return null;
  }
  const completedAt: string | null =
    typeof p_value.completed_at === "string" ? p_value.completed_at : null;
  return {
    id: p_value.id,
    mission_id: p_value.mission_id,
    status: "Completed",
    title: p_value.title,
    completed_at: completedAt,
    closing: readClosing(p_value.closing),
  };
}

export function readCompletedEnvelope(p_value: unknown): CompletedEnvelope | null {
  if (!isRecord(p_value) || typeof p_value.id !== "string") {
    return null;
  }
  if (!Array.isArray(p_value.missions)) {
    return null;
  }
  const missions: CompletedMissionItem[] = [];
  for (const p_item of p_value.missions) {
    const item: CompletedMissionItem | null = readItem(p_item);
    if (item === null) {
      return null;
    }
    missions.push(item);
  }
  return { id: p_value.id, missions };
}
