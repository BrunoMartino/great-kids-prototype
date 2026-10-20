import type { IMissionMessage } from "./mission-message-protocol";

export class MissionDecorator implements IMissionMessage {
  public constructor(protected mission: IMissionMessage) {}

  public getId(): string {
    return this.mission.getId();
  }

  public getTitle(): string {
    return this.mission.getTitle();
  }

  public getDescription(): string {
    return this.mission.getDescription();
  }

  public getReviewStatus(): string {
    return this.mission.getReviewStatus();
  }
}
