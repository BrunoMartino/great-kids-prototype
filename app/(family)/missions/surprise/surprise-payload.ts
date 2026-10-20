export type SurpriseHit = {
  kind: "hit";
  id: string;
  mission_id: string;
  status: "Accepted";
  title: string;
  description: string;
  review_status: "published";
};

export type SurpriseMiss = {
  kind: "empty";
  id: string;
  mission_id: null;
};

export type SurprisePayload = SurpriseHit | SurpriseMiss;

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

function hasInventedCopy(p_value: Record<string, unknown>): boolean {
  const title: unknown = Reflect.get(p_value, "title");
  const description: unknown = Reflect.get(p_value, "description");
  if (typeof title === "string" && title.trim().length > 0) {
    return true;
  }
  if (typeof description === "string" && description.trim().length > 0) {
    return true;
  }
  return false;
}

export function readSurprisePayload(p_value: unknown): SurprisePayload | null {
  if (!isRecord(p_value) || typeof p_value.id !== "string") {
    return null;
  }
  if (p_value.mission_id === null) {
    if (hasInventedCopy(p_value)) {
      return null;
    }
    return { kind: "empty", id: p_value.id, mission_id: null };
  }
  if (typeof p_value.mission_id !== "string" || p_value.mission_id.length === 0) {
    return null;
  }
  if (p_value.status !== "Accepted") {
    return null;
  }
  if (p_value.review_status !== "published") {
    return null;
  }
  if (typeof p_value.title !== "string") {
    return null;
  }
  const description: string =
    typeof p_value.description === "string" ? p_value.description : "";
  return {
    kind: "hit",
    id: p_value.id,
    mission_id: p_value.mission_id,
    status: "Accepted",
    title: p_value.title,
    description,
    review_status: "published",
  };
}
