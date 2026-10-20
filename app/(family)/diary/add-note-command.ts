import type { DiaryCommand } from "./diary-command";
import {
  readDiaryPayload,
  type AddNoteDraft,
  type DiaryPayload,
} from "./diary-payload";
import {
  DiaryForbiddenError,
  DiaryIllegalError,
  DiaryMissingFamilyError,
} from "./list-diary-command";

export class AddDiaryNoteCommand implements DiaryCommand {
  public constructor(
    private readonly p_familyId: string,
    private readonly p_draft: AddNoteDraft,
  ) {}

  public async execute(): Promise<DiaryPayload> {
    const body: AddNoteDraft = {
      kind: this.p_draft.kind,
      text: this.p_draft.text,
    };
    if (
      this.p_draft.mission_id !== undefined &&
      this.p_draft.family_mission_id !== undefined
    ) {
      body.mission_id = this.p_draft.mission_id;
      body.family_mission_id = this.p_draft.family_mission_id;
    }
    const response: Response = await fetch(
      `/api/families/${encodeURIComponent(this.p_familyId)}/diary`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(body),
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
      throw new Error(`add note failed:${String(response.status)}`);
    }
    const parsed: unknown = await response.json();
    const payload: DiaryPayload | null = readDiaryPayload(parsed);
    if (payload === null) {
      throw new Error("diary envelope invalid");
    }
    return payload;
  }

  public async undo(): Promise<void> {
    return;
  }
}
