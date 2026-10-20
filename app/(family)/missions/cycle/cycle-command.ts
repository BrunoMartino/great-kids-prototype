import type { CyclePayload } from "./cycle-payload";

export interface CycleCommand {
  execute(): Promise<CyclePayload>;
  undo(): Promise<void>;
}
