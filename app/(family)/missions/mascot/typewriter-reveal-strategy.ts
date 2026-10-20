import { RevealStrategy, type RevealTick } from "./reveal-strategy";

function splitRevealUnits(p_fullText: string): string[] {
  if (typeof Intl.Segmenter === "function") {
    const segmenter: Intl.Segmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    });
    const units: string[] = [];
    for (const part of segmenter.segment(p_fullText)) {
      units.push(part.segment);
    }
    return units;
  }
  return Array.from(p_fullText);
}

export class TypewriterRevealStrategy extends RevealStrategy {
  public constructor(
    private p_slowMs: number = 72,
    private p_fastMs: number = 16,
    private p_slowUntil: number = 18,
  ) {
    super();
  }

  public getRevealed(
    p_fullText: string,
    p_onTick: RevealTick,
  ): () => void {
    if (p_fullText.length === 0) {
      this.revealed = "";
      p_onTick("");
      return (): void => {};
    }

    const units: string[] = splitRevealUnits(p_fullText);
    let index: number = 0;
    let rafId: number = 0;
    let lastTickAt: number = 0;
    let cancelled: boolean = false;
    this.revealed = "";
    p_onTick("");

    const frame = (p_now: number): void => {
      if (cancelled) {
        return;
      }
      const delay: number = index < this.p_slowUntil ? this.p_slowMs : this.p_fastMs;
      if (lastTickAt === 0) {
        lastTickAt = p_now;
      }
      if (p_now - lastTickAt >= delay) {
        lastTickAt = p_now;
        index += 1;
        this.revealed = units.slice(0, index).join("");
        p_onTick(this.revealed);
      }
      if (index < units.length) {
        rafId = window.requestAnimationFrame(frame);
      }
    };

    rafId = window.requestAnimationFrame(frame);

    return (): void => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
    };
  }
}
