import {
  parseQuizAnswerEnvelope,
  type AchievementsEnvelope,
  type GpsDocument,
  type QuizAnswerEnvelope,
  type RhythmsEnvelope,
} from "@/models/family_profile";

export abstract class GpsComponent {
  private parent: GpsComponent | null = null;

  public getParent(): GpsComponent | null {
    return this.parent;
  }

  public setParent(p_parent: GpsComponent | null): void {
    this.parent = p_parent;
  }

  public add(...p_children: GpsComponent[]): void {
    void p_children;
  }

  public remove(p_child: GpsComponent): void {
    void p_child;
  }

  public getChildren(): GpsComponent[] {
    return [];
  }

  public abstract toEnvelope(): unknown;
}

export class QuizAnswerLeaf extends GpsComponent {
  public constructor(private readonly p_envelope: QuizAnswerEnvelope) {
    super();
  }

  public toEnvelope(): QuizAnswerEnvelope {
    return this.p_envelope;
  }
}

export class RhythmsLeaf extends GpsComponent {
  public constructor(private readonly p_envelope: RhythmsEnvelope) {
    super();
  }

  public toEnvelope(): RhythmsEnvelope {
    return this.p_envelope;
  }
}

export class AchievementsLeaf extends GpsComponent {
  public constructor(private readonly p_envelope: AchievementsEnvelope) {
    super();
  }

  public toEnvelope(): AchievementsEnvelope {
    return this.p_envelope;
  }
}

export class ProfileComposite extends GpsComponent {
  private children: GpsComponent[] = [];

  public constructor(
    public readonly p_id: string,
    public readonly p_profileNotes: string | null = null,
  ) {
    super();
  }

  public add(...p_children: GpsComponent[]): void {
    p_children.forEach((p_child: GpsComponent) => {
      p_child.setParent(this);
      this.children.push(p_child);
    });
  }

  public remove(p_child: GpsComponent): void {
    this.children = this.children.filter((p_item: GpsComponent) => p_item !== p_child);
    p_child.setParent(null);
  }

  public getChildren(): GpsComponent[] {
    return this.children;
  }

  public toEnvelope(): GpsDocument {
    let quiz: QuizAnswerEnvelope | null = null;
    let rhythms: RhythmsEnvelope | null = null;
    let achievements: AchievementsEnvelope | null = null;
    for (const p_child of this.children) {
      if (p_child instanceof QuizAnswerLeaf) {
        quiz = p_child.toEnvelope();
      }
      if (p_child instanceof RhythmsLeaf) {
        rhythms = p_child.toEnvelope();
      }
      if (p_child instanceof AchievementsLeaf) {
        achievements = p_child.toEnvelope();
      }
    }
    if (quiz === null || rhythms === null || achievements === null) {
      throw new Error("incomplete gps document");
    }
    return {
      id: this.p_id,
      quiz_answer: quiz,
      rhythms,
      achievements,
      profile_notes: this.p_profileNotes,
    };
  }

  public static fromStored(
    p_quizJson: string,
    p_rhythmsJson: string,
    p_achievementsJson: string,
    p_id: string = "",
    p_notes: string | null = null,
  ): ProfileComposite {
    const quiz: QuizAnswerEnvelope = parseQuizAnswerEnvelope(p_quizJson);
    const rhythmsParsed: unknown = JSON.parse(p_rhythmsJson);
    const achievementsParsed: unknown = JSON.parse(p_achievementsJson);
    if (Array.isArray(rhythmsParsed) || Array.isArray(achievementsParsed)) {
      throw new Error("gps envelopes must not be bare arrays");
    }
    const rhythms: RhythmsEnvelope = rhythmsParsed as RhythmsEnvelope;
    const achievements: AchievementsEnvelope = achievementsParsed as AchievementsEnvelope;
    const hub: ProfileComposite = new ProfileComposite(p_id === "" ? quiz.id : p_id, p_notes);
    hub.add(new QuizAnswerLeaf(quiz), new RhythmsLeaf(rhythms), new AchievementsLeaf(achievements));
    return hub;
  }
}
