export type RevealTick = (p_shown: string) => void;

export class RevealStrategy {
  protected revealed: string = "";

  public getRevealed(
    p_fullText: string,
    p_onTick: RevealTick,
  ): () => void {
    this.revealed = p_fullText;
    p_onTick(p_fullText);
    return (): void => {};
  }
}
