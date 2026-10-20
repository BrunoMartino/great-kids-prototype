import type { CompletedCommand } from "./completed-command";
import {
  readCompletedEnvelope,
  type CompletedEnvelope,
} from "./completed-payload";

export class HistoryForbiddenError extends Error {
  public constructor() {
    super("forbidden");
    this.name = "HistoryForbiddenError";
  }
}

export class HistoryMissingFamilyError extends Error {
  public constructor() {
    super("not found");
    this.name = "HistoryMissingFamilyError";
  }
}

export class HistoryIllegalError extends Error {
  public constructor() {
    super("unprocessable");
    this.name = "HistoryIllegalError";
  }
}

export class ListCompletedCommand implements CompletedCommand {
  public constructor(private readonly p_familyId: string) {}

  public async execute(): Promise<CompletedEnvelope> {
    const response: Response = await fetch(
      `/api/families/${encodeURIComponent(this.p_familyId)}/missions?status=Completed`,
      {
        method: "GET",
        cache: "no-store",
      },
    );
    if (response.status === 403) {
      throw new HistoryForbiddenError();
    }
    if (response.status === 404) {
      throw new HistoryMissingFamilyError();
    }
    if (response.status === 422) {
      throw new HistoryIllegalError();
    }
    if (!response.ok) {
      throw new Error(`history failed:${String(response.status)}`);
    }
    const body: unknown = await response.json();
    const envelope: CompletedEnvelope | null = readCompletedEnvelope(body);
    if (envelope === null) {
      throw new Error("history envelope invalid");
    }
    return envelope;
  }

  public async undo(): Promise<void> {
    return;
  }
}
