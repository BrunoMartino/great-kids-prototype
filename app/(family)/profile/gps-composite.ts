export type QuizAnswerItem = {
  question_id: string;
  answer_text: string;
  deleted: boolean;
};

export type QuizAnswerEnvelope = {
  id: string;
  answers: QuizAnswerItem[];
};

export type RhythmsEnvelope = {
  id: string;
  rhythms: unknown[];
};

export type AchievementsEnvelope = {
  id: string;
  achievements: unknown[];
};

export type GpsDocument = {
  id: string;
  quiz_answer: QuizAnswerEnvelope;
  rhythms: RhythmsEnvelope;
  achievements: AchievementsEnvelope;
  profile_notes: string | null;
};

export abstract class GpsComponent {
  private parent: GpsComponent | null = null;

  public getParent(): GpsComponent | null {
    return this.parent;
  }

  public setParent(p_parent: GpsComponent | null): void {
    this.parent = p_parent;
  }

  public abstract label(): string;

  public add(...p_products: GpsComponent[]): void {
    void p_products;
  }

  public remove(p_product: GpsComponent): void {
    void p_product;
  }

  public getChildren(): GpsComponent[] {
    return [];
  }
}

export class QuizAnswerLeaf extends GpsComponent {
  public constructor(public readonly p_envelope: QuizAnswerEnvelope) {
    super();
  }

  public label(): string {
    const live: number = this.p_envelope.answers.filter(
      (p_item: QuizAnswerItem) => p_item.deleted === false,
    ).length;
    return `${String(live)} respostas`;
  }
}

export class RhythmsLeaf extends GpsComponent {
  public constructor(public readonly p_envelope: RhythmsEnvelope) {
    super();
  }

  public label(): string {
    return `${String(this.p_envelope.rhythms.length)} ritmos`;
  }
}

export class AchievementsLeaf extends GpsComponent {
  public constructor(public readonly p_envelope: AchievementsEnvelope) {
    super();
  }

  public label(): string {
    return `${String(this.p_envelope.achievements.length)} conquistas`;
  }
}

export class ProfileComposite extends GpsComponent {
  private children: GpsComponent[] = [];

  public constructor(
    public readonly p_id: string,
    public readonly p_profileNotes: string | null,
  ) {
    super();
  }

  public add(...p_products: GpsComponent[]): void {
    p_products.forEach((p_product: GpsComponent) => {
      p_product.setParent(this);
      this.children.push(p_product);
    });
  }

  public remove(p_product: GpsComponent): void {
    this.children = this.children.filter(
      (p_child: GpsComponent) => p_child !== p_product,
    );
    p_product.setParent(null);
  }

  public getChildren(): GpsComponent[] {
    return this.children;
  }

  public label(): string {
    return this.children
      .map((p_child: GpsComponent) => p_child.label())
      .join(" · ");
  }

  public toDocument(): GpsDocument {
    let quizAnswer: QuizAnswerEnvelope = { id: this.p_id, answers: [] };
    let rhythms: RhythmsEnvelope = { id: this.p_id, rhythms: [] };
    let achievements: AchievementsEnvelope = {
      id: this.p_id,
      achievements: [],
    };
    for (const p_child of this.children) {
      if (p_child instanceof QuizAnswerLeaf) {
        quizAnswer = p_child.p_envelope;
      }
      if (p_child instanceof RhythmsLeaf) {
        rhythms = p_child.p_envelope;
      }
      if (p_child instanceof AchievementsLeaf) {
        achievements = p_child.p_envelope;
      }
    }
    return {
      id: this.p_id,
      quiz_answer: quizAnswer,
      rhythms,
      achievements,
      profile_notes: this.p_profileNotes,
    };
  }

  public static fromDocument(p_document: GpsDocument): ProfileComposite {
    const composite: ProfileComposite = new ProfileComposite(
      p_document.id,
      p_document.profile_notes,
    );
    composite.add(
      new QuizAnswerLeaf(p_document.quiz_answer),
      new RhythmsLeaf(p_document.rhythms),
      new AchievementsLeaf(p_document.achievements),
    );
    return composite;
  }
}
