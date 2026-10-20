import type { DiaryDocument } from "@/models/family_diary";

export interface DiaryCommand {
  execute(): DiaryDocument;
  undo(): void;
}
