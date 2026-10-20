import type { IMissionMessage } from "./mission-message-protocol";

export type PublishedMissionPayload = {
  id: string;
  title: string;
  description: string;
  review_status: string;
};

export class UnpublishedMissionError extends Error {
  public constructor() {
    super("unpublished");
    this.name = "UnpublishedMissionError";
  }
}

export class PublishedMission implements IMissionMessage {
  public constructor(p_payload: PublishedMissionPayload) {
    if (p_payload.review_status !== "published") {
      throw new UnpublishedMissionError();
    }
    this.id = p_payload.id;
    this.title = p_payload.title;
    this.description = p_payload.description;
    this.reviewStatus = p_payload.review_status;
  }

  private id: string;
  private title: string;
  private description: string;
  private reviewStatus: string;

  public getId(): string {
    return this.id;
  }

  public getTitle(): string {
    return this.title;
  }

  public getDescription(): string {
    return this.description;
  }

  public getReviewStatus(): string {
    return this.reviewStatus;
  }
}
