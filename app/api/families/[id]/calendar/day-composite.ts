import type { FamilyCalendarRow } from "@/models/family_calendar";

export type SuggestionItem = {
  id: string;
  mission_id: string;
  curated_material_id: string | null;
  status: string;
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

function isRecord(p_value: unknown): p_value is Record<string, unknown> {
  return p_value !== null && typeof p_value === "object" && !Array.isArray(p_value);
}

function isStatus(p_status: string): boolean {
  return p_status === "scheduled" || p_status === "done" || p_status === "moved";
}

function parseSuggestion(p_value: unknown): SuggestionItem {
  if (!isRecord(p_value)) {
    throw new Error("invalid suggestion");
  }
  if (typeof p_value.id !== "string" || typeof p_value.mission_id !== "string") {
    throw new Error("invalid suggestion");
  }
  if (typeof p_value.status !== "string" || !isStatus(p_value.status)) {
    throw new Error("invalid suggestion status");
  }
  const material: string | null =
    typeof p_value.curated_material_id === "string" ? p_value.curated_material_id : null;
  return {
    id: p_value.id,
    mission_id: p_value.mission_id,
    curated_material_id: material,
    status: p_value.status,
  };
}

export function parseSuggestionsEnvelope(p_value: unknown): SuggestionsEnvelope {
  let parsed: unknown = p_value;
  if (typeof p_value === "string") {
    parsed = JSON.parse(p_value);
  }
  if (Array.isArray(parsed)) {
    throw new Error("suggestions must be an envelope");
  }
  if (!isRecord(parsed) || typeof parsed.id !== "string" || !Array.isArray(parsed.suggestions)) {
    throw new Error("suggestions must be an envelope");
  }
  return {
    id: parsed.id,
    suggestions: parsed.suggestions.map(parseSuggestion),
  };
}

export abstract class DayComponent {
  private parent: DayComponent | null = null;

  public getParent(): DayComponent | null {
    return this.parent;
  }

  public setParent(p_parent: DayComponent | null): void {
    this.parent = p_parent;
  }

  public add(...p_children: DayComponent[]): void {
    void p_children;
  }

  public remove(p_child: DayComponent): void {
    void p_child;
  }

  public getChildren(): DayComponent[] {
    return [];
  }
}

export class SuggestionLeaf extends DayComponent {
  public constructor(public readonly p_item: SuggestionItem) {
    super();
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

  public add(...p_children: DayComponent[]): void {
    p_children.forEach((p_child: DayComponent) => {
      p_child.setParent(this);
      this.children.push(p_child);
    });
  }

  public getChildren(): DayComponent[] {
    return this.children;
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

  public static empty(p_familyId: string, p_day: string): DayComposite {
    return new DayComposite(
      crypto.randomUUID(),
      p_familyId,
      p_day,
      null,
      false,
      crypto.randomUUID(),
    );
  }

  public static fromEnvelope(
    p_familyId: string,
    p_day: string,
    p_envelope: SuggestionsEnvelope,
    p_previousWeather: string | null = null,
    p_notifications: boolean = false,
  ): DayComposite {
    const parsed: SuggestionsEnvelope = parseSuggestionsEnvelope(p_envelope);
    const hub: DayComposite = new DayComposite(
      crypto.randomUUID(),
      p_familyId,
      p_day,
      p_previousWeather,
      p_notifications,
      parsed.id,
    );
    for (const p_item of parsed.suggestions) {
      hub.add(new SuggestionLeaf(p_item));
    }
    return hub;
  }

  public static fromStored(p_row: FamilyCalendarRow): DayComposite {
    const parsed: SuggestionsEnvelope = parseSuggestionsEnvelope(p_row.suggestions);
    const hub: DayComposite = new DayComposite(
      p_row.id,
      p_row.family_id,
      p_row.day,
      p_row.previous_weather,
      p_row.notifications === 1,
      parsed.id,
    );
    for (const p_item of parsed.suggestions) {
      hub.add(new SuggestionLeaf(p_item));
    }
    return hub;
  }
}
