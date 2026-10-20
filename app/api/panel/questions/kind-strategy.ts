import { FamilyQuiz, type FamilyQuizRecord } from "@/models/family_quiz";

export class KindStrategy {
  public constructor(public readonly kind: string = "") {}

  public offer(): FamilyQuizRecord[] {
    return FamilyQuiz.instance.listLive(this.kind);
  }
}

export class FamilyQuizKindStrategy extends KindStrategy {
  public constructor() {
    super("Family-Quiz");
  }
}

export class SayWhatKindStrategy extends KindStrategy {
  public constructor() {
    super("Say-What");
  }
}
