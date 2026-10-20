import type { CycleCommand } from "./cycle-command";
import { readCyclePayload, type CyclePayload } from "./cycle-payload";

export class CycleForbiddenError extends Error {
  public constructor() {
    super("forbidden");
    this.name = "CycleForbiddenError";
  }
}

export class CycleMissingError extends Error {
  public constructor() {
    super("not found");
    this.name = "CycleMissingError";
  }
}

export class CycleIllegalError extends Error {
  public constructor() {
    super("unprocessable");
    this.name = "CycleIllegalError";
  }
}

export class StartDoingCommand implements CycleCommand {
  public constructor(private readonly p_cycleId: string) {}

  public async execute(): Promise<CyclePayload> {
    const response: Response = await fetch(
      `/api/family-missions/${encodeURIComponent(this.p_cycleId)}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ status: "Doing" }),
      },
    );
    if (response.status === 403) {
      throw new CycleForbiddenError();
    }
    if (response.status === 404) {
      throw new CycleMissingError();
    }
    if (response.status === 422) {
      throw new CycleIllegalError();
    }
    if (!response.ok) {
      throw new Error(`start doing failed:${String(response.status)}`);
    }
    const body: unknown = await response.json();
    const payload: CyclePayload | null = readCyclePayload(body);
    if (payload === null || payload.status !== "Doing") {
      throw new Error("start doing envelope invalid");
    }
    return payload;
  }

  public async undo(): Promise<void> {
    return;
  }
}
