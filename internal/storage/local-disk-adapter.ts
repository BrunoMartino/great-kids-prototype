import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import {
  assertUploadPayload,
  objectKeyFor,
  type ObjectStoreProtocol,
} from "@/internal/storage/object-store";

export class LocalDiskAdapter implements ObjectStoreProtocol {
  public constructor(public p_rootDir: string) {}

  public async put(
    p_fileName: string,
    p_bytes: Uint8Array,
    p_contentType: string,
  ): Promise<string> {
    assertUploadPayload(p_bytes, p_contentType);
    const key: string = objectKeyFor(p_fileName);
    const absolute: string = join(this.p_rootDir, key);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, p_bytes);
    return key;
  }

  public async delete(p_key: string): Promise<void> {
    const absolute: string = join(this.p_rootDir, p_key);
    try {
      unlinkSync(absolute);
    } catch {
      return;
    }
  }

  public publicUrl(p_key: string): string {
    return resolve(this.p_rootDir, p_key);
  }
}
