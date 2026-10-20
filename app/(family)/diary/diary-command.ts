import type { DiaryPayload } from "./diary-payload";

export interface DiaryCommand {
  execute(): Promise<DiaryPayload>;
  undo(): Promise<void>;
}
