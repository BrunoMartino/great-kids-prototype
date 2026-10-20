export type QuizMode = "solo" | "table";

export class ModeStrategy {
  public constructor(public readonly mode: QuizMode = "solo") {}

  public resolve(p_mode?: string): QuizMode {
    const value: string = p_mode ?? this.mode;
    if (value !== "solo" && value !== "table") {
      throw new Error("invalid mode");
    }
    return value;
  }

  public prompt(): string {
    return "One adult answers alone.";
  }
}

export class SoloModeStrategy extends ModeStrategy {
  public constructor() {
    super("solo");
  }

  public prompt(): string {
    return "One adult answers alone.";
  }
}

export class TableModeStrategy extends ModeStrategy {
  public constructor() {
    super("table");
  }

  public prompt(): string {
    return "The family answers together, at the table.";
  }
}

export function modeStrategyFor(p_mode: QuizMode): ModeStrategy {
  if (p_mode === "table") {
    return new TableModeStrategy();
  }
  return new SoloModeStrategy();
}
