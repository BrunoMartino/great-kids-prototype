import { RevealStrategy, type RevealTick } from "./reveal-strategy";

export class InstantRevealStrategy extends RevealStrategy {
  public constructor() {
    super();
  }

  public getRevealed(
    p_fullText: string,
    p_onTick: RevealTick,
  ): () => void {
    this.revealed = p_fullText;
    p_onTick(p_fullText);
    return (): void => {};
  }
}
