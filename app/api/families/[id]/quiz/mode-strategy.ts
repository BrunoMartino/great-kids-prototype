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
}

export class SoloModeStrategy extends ModeStrategy {
  public constructor() {
    super("solo");
  }
}

export class TableModeStrategy extends ModeStrategy {
  public constructor() {
    super("table");
  }
}
