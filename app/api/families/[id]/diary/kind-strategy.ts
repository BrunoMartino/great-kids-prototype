export class UnknownNoteKindError extends Error {
  public constructor() {
    super("unknown note kind");
    this.name = "UnknownNoteKindError";
  }
}

export class NoteKindStrategy {
  public constructor(public readonly kind: string = "") {}

  public accept(p_kind: string): string {
    if (p_kind !== this.kind || this.kind === "") {
      throw new UnknownNoteKindError();
    }
    return this.kind;
  }
}

export class PhraseKindStrategy extends NoteKindStrategy {
  public constructor() {
    super("phrase");
  }
}

export class FirstTimeKindStrategy extends NoteKindStrategy {
  public constructor() {
    super("first_time");
  }
}

export class FunnyKindStrategy extends NoteKindStrategy {
  public constructor() {
    super("funny");
  }
}

export class LearnedKindStrategy extends NoteKindStrategy {
  public constructor() {
    super("learned");
  }
}

export class FamilyFailKindStrategy extends NoteKindStrategy {
  public constructor() {
    super("family_fail");
  }
}

export function resolveNoteKind(p_kind: string): NoteKindStrategy {
  const strategies: NoteKindStrategy[] = [
    new PhraseKindStrategy(),
    new FirstTimeKindStrategy(),
    new FunnyKindStrategy(),
    new LearnedKindStrategy(),
    new FamilyFailKindStrategy(),
  ];
  const found: NoteKindStrategy | undefined = strategies.find(
    (p_strategy: NoteKindStrategy) => p_strategy.kind === p_kind,
  );
  if (found === undefined) {
    throw new UnknownNoteKindError();
  }
  found.accept(p_kind);
  return found;
}
