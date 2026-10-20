export type CycleClosing = {
  do_again: boolean;
  save_memory: boolean;
};

export type CyclePayload = {
  id: string;
  fam_id: string;
  mission_id: string;
  status: "Doing" | "Completed";
  closing: CycleClosing | null;
};

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

function readClosing(p_value: unknown): CycleClosing | null {
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
  if (Array.isArray(p_value)) {
    return null;
  }
  return { do_again: p_value.do_again, save_memory: p_value.save_memory };
}

export function readCyclePayload(p_value: unknown): CyclePayload | null {
  if (!isRecord(p_value) || typeof p_value.id !== "string") {
    return null;
  }
  if (typeof p_value.fam_id !== "string") {
    return null;
  }
  if (typeof p_value.mission_id !== "string") {
    return null;
  }
  if (p_value.status !== "Doing" && p_value.status !== "Completed") {
    return null;
  }
  const closing: CycleClosing | null = readClosing(p_value.closing);
  if (p_value.status === "Doing" && p_value.closing !== null) {
    return null;
  }
  if (p_value.status === "Completed" && closing === null) {
    return null;
  }
  return {
    id: p_value.id,
    fam_id: p_value.fam_id,
    mission_id: p_value.mission_id,
    status: p_value.status,
    closing,
  };
}
