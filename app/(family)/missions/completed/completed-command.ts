import type { CompletedEnvelope } from "./completed-payload";

export interface CompletedCommand {
  execute(): Promise<CompletedEnvelope>;
  undo(): Promise<void>;
}
