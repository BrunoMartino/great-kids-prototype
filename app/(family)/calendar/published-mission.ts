export type PublishedMissionPayload = {
  id: string;
  title: string;
  review_status: string;
};

export class UnpublishedMissionError extends Error {
  public constructor() {
    super("unpublished");
    this.name = "UnpublishedMissionError";
  }
}

export class PublishedMission {
  public constructor(p_payload: PublishedMissionPayload) {
    if (p_payload.review_status !== "published") {
      throw new UnpublishedMissionError();
    }
    this.id = p_payload.id;
    this.title = p_payload.title;
    this.reviewStatus = p_payload.review_status;
  }

  private id: string;
  private title: string;
  private reviewStatus: string;

  public getId(): string {
    return this.id;
  }

  public getTitle(): string {
    return this.title;
  }

  public getReviewStatus(): string {
    return this.reviewStatus;
  }
}

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object";
}

export function readPublishedMission(p_value: unknown): PublishedMission {
  if (!isRecord(p_value)) {
    throw new UnpublishedMissionError();
  }
  const mission: unknown = Reflect.get(p_value, "mission");
  if (!isRecord(mission)) {
    throw new UnpublishedMissionError();
  }
  const id: unknown = Reflect.get(mission, "id");
  const title: unknown = Reflect.get(mission, "title");
  const reviewStatus: unknown = Reflect.get(mission, "review_status");
  if (typeof id !== "string" || id.length === 0) {
    throw new UnpublishedMissionError();
  }
  if (typeof title !== "string") {
    throw new UnpublishedMissionError();
  }
  if (typeof reviewStatus !== "string") {
    throw new UnpublishedMissionError();
  }
  return new PublishedMission({
    id,
    title,
    review_status: reviewStatus,
  });
}
