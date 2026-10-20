import { MissionDecorator } from "./mission-decorator";
import type { IMissionMessage } from "./mission-message-protocol";
import { UnpublishedMissionError } from "./published-mission";

export class MascotMessageDecorator extends MissionDecorator {
  public constructor(p_mission: IMissionMessage) {
    super(p_mission);
    if (p_mission.getReviewStatus() !== "published") {
      throw new UnpublishedMissionError();
    }
  }

  public getVoiceName(): string {
    return "Mascote";
  }

  public isTitleEmpty(): boolean {
    return this.mission.getTitle().trim().length === 0;
  }

  public isDescriptionEmpty(): boolean {
    return this.mission.getDescription().trim().length === 0;
  }

  public isCopyEmpty(): boolean {
    return this.isTitleEmpty() && this.isDescriptionEmpty();
  }
}
