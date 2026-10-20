export type SuggestionStatus = "scheduled" | "done" | "moved";

export type SuggestionItem = {
  id: string;
  mission_id: string;
  curated_material_id: string | null;
  status: SuggestionStatus;
};

export type SuggestionsEnvelope = {
  id: string;
  suggestions: SuggestionItem[];
};

export type DayDocument = {
  id: string;
  family_id: string;
  day: string;
  previous_weather: string | null;
  notifications: boolean;
  suggestions: SuggestionsEnvelope;
};

export abstract class DayComponent {
  private parent: DayComponent | null = null;

  public getParent(): DayComponent | null {
    return this.parent;
  }

  public setParent(p_parent: DayComponent | null): void {
    this.parent = p_parent;
  }

  public abstract statusLabel(): string;

  public add(...p_products: DayComponent[]): void {
    void p_products;
  }

  public remove(p_product: DayComponent): void {
    void p_product;
  }

  public getChildren(): DayComponent[] {
    return [];
  }
}

export class SuggestionLeaf extends DayComponent {
  public constructor(public readonly p_item: SuggestionItem) {
    super();
  }

  public statusLabel(): string {
    return this.p_item.status;
  }
}

export class DayComposite extends DayComponent {
  private children: DayComponent[] = [];

  public constructor(
    public readonly p_id: string,
    public readonly p_familyId: string,
    public readonly p_day: string,
    public readonly p_previousWeather: string | null,
    public readonly p_notifications: boolean,
    public readonly p_envelopeId: string,
  ) {
    super();
  }

  public add(...p_products: DayComponent[]): void {
    p_products.forEach((p_product: DayComponent) => {
      p_product.setParent(this);
      this.children.push(p_product);
    });
  }

  public remove(p_product: DayComponent): void {
    this.children = this.children.filter(
      (p_child: DayComponent) => p_child !== p_product,
    );
    p_product.setParent(null);
  }

  public getChildren(): DayComponent[] {
    return this.children;
  }

  public statusLabel(): string {
    const labels: string[] = this.children.map((p_child: DayComponent) =>
      p_child.statusLabel(),
    );
    if (labels.length === 0) {
      return "vazio";
    }
    return labels.join(" · ");
  }

  public toDocument(): DayDocument {
    const suggestions: SuggestionItem[] = [];
    for (const p_child of this.children) {
      if (p_child instanceof SuggestionLeaf) {
        suggestions.push(p_child.p_item);
      }
    }
    return {
      id: this.p_id,
      family_id: this.p_familyId,
      day: this.p_day,
      previous_weather: this.p_previousWeather,
      notifications: this.p_notifications,
      suggestions: { id: this.p_envelopeId, suggestions },
    };
  }

  public static fromDocument(p_document: DayDocument): DayComposite {
    const composite: DayComposite = new DayComposite(
      p_document.id,
      p_document.family_id,
      p_document.day,
      p_document.previous_weather,
      p_document.notifications,
      p_document.suggestions.id,
    );
    for (const p_item of p_document.suggestions.suggestions) {
      composite.add(new SuggestionLeaf(p_item));
    }
    return composite;
  }
}
