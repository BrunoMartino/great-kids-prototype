import type { CycleCommand } from "./cycle-command";
import {
  readCyclePayload,
  type CycleClosing,
  type CyclePayload,
} from "./cycle-payload";
import {
  CycleForbiddenError,
  CycleIllegalError,
  CycleMissingError,
} from "./start-doing-command";

export class CompleteMissionCommand implements CycleCommand {
  public constructor(
    private readonly p_cycleId: string,
    private readonly p_closing: CycleClosing,
  ) {}

  public async execute(): Promise<CyclePayload> {
    const response: Response = await fetch(
      `/api/family-missions/${encodeURIComponent(this.p_cycleId)}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          status: "Completed",
          closing: {
            do_again: this.p_closing.do_again,
            save_memory: this.p_closing.save_memory,
          },
        }),
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
      throw new Error(`complete failed:${String(response.status)}`);
    }
    const body: unknown = await response.json();
    const payload: CyclePayload | null = readCyclePayload(body);
    if (payload === null || payload.status !== "Completed") {
      throw new Error("complete envelope invalid");
    }
    return payload;
  }

  public async undo(): Promise<void> {
    return;
  }
}
