import type { NoteKind } from "./diary-payload";

export class NoteKindPresentationStrategy {
  public constructor(
    public readonly kind: NoteKind,
    public readonly label: string,
  ) {}
}

export function noteKindStrategies(): NoteKindPresentationStrategy[] {
  return [
    new NoteKindPresentationStrategy("phrase", "Frase"),
    new NoteKindPresentationStrategy("first_time", "Primeira vez"),
    new NoteKindPresentationStrategy("funny", "Momento engraçado"),
    new NoteKindPresentationStrategy("learned", "Algo aprendido"),
    new NoteKindPresentationStrategy("family_fail", "Family Fail"),
  ];
}

export function isNoteKind(p_value: string): p_value is NoteKind {
  return noteKindStrategies().some(
    (p_strategy: NoteKindPresentationStrategy): boolean => {
      return p_strategy.kind === p_value;
    },
  );
}

export function labelForKind(p_kind: string): string {
  const found: NoteKindPresentationStrategy | undefined = noteKindStrategies().find(
    (p_strategy: NoteKindPresentationStrategy): boolean => {
      return p_strategy.kind === p_kind;
    },
  );
  if (found === undefined) {
    return p_kind;
  }
  return found.label;
}
