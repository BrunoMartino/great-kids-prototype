export class KindFilterStrategy {
  public constructor(public readonly kind: string = "") {}

  public queryPath(): string {
    return "/api/panel/questions";
  }

  public matches(p_kind: string): boolean {
    return this.kind === "" || p_kind === this.kind;
  }
}

export class FamilyQuizKindFilter extends KindFilterStrategy {
  public constructor() {
    super("Family-Quiz");
  }
}

export class SayWhatKindFilter extends KindFilterStrategy {
  public constructor() {
    super("Say-What");
  }
}

export function kindFilterFor(
  p_kind: "Family-Quiz" | "Say-What" | null,
): KindFilterStrategy {
  if (p_kind === "Family-Quiz") {
    return new FamilyQuizKindFilter();
  }
  if (p_kind === "Say-What") {
    return new SayWhatKindFilter();
  }
  return new KindFilterStrategy();
}
