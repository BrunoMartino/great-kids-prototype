import type { DiaryCommand } from "./diary-command";
import { readDiaryPayload, type DiaryPayload } from "./diary-payload";

export class DiaryForbiddenError extends Error {
  public constructor() {
    super("forbidden");
    this.name = "DiaryForbiddenError";
  }
}

export class DiaryMissingFamilyError extends Error {
  public constructor() {
    super("not found");
    this.name = "DiaryMissingFamilyError";
  }
}

export class DiaryIllegalError extends Error {
  public constructor() {
    super("unprocessable");
    this.name = "DiaryIllegalError";
  }
}

export class ListDiaryCommand implements DiaryCommand {
  public constructor(private readonly p_familyId: string) {}

  public async execute(): Promise<DiaryPayload> {
    const response: Response = await fetch(
      `/api/families/${encodeURIComponent(this.p_familyId)}/diary`,
      {
        method: "GET",
        cache: "no-store",
      },
    );
    if (response.status === 403) {
      throw new DiaryForbiddenError();
    }
    if (response.status === 404) {
      throw new DiaryMissingFamilyError();
    }
    if (response.status === 422) {
      throw new DiaryIllegalError();
    }
    if (!response.ok) {
      throw new Error(`diary failed:${String(response.status)}`);
    }
    const body: unknown = await response.json();
    const payload: DiaryPayload | null = readDiaryPayload(body);
    if (payload === null) {
      throw new Error("diary envelope invalid");
    }
    return payload;
  }

  public async undo(): Promise<void> {
    return;
  }
}
