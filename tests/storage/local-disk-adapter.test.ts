import { mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arrangeTestSqlitePath } from "../helpers/sqlite-path";

function clearS3Env(): void {
  delete process.env.S3_ENDPOINT;
  delete process.env.S3_BUCKET;
  delete process.env.S3_ACCESS_KEY;
  delete process.env.S3_SECRET_KEY;
}

describe("LocalDiskAdapter", () => {
  beforeEach(() => {
    arrangeTestSqlitePath();
    clearS3Env();
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("puts and deletes a key under great-kids/", async () => {
    // Break: key missing prefix, file not written, or delete leaves the object.
    const rootDir: string = mkdtempSync(join(tmpdir(), "gk-objects-"));
    const { LocalDiskAdapter } = await import("@/internal/storage/local-disk-adapter");
    const store = new LocalDiskAdapter(rootDir);
    const bytes: Uint8Array = new Uint8Array([137, 80, 78, 71]);
    const key: string = await store.put("mascot.png", bytes, "image/png");
    expect(key.startsWith("great-kids/")).toBe(true);
    expect(key.includes("..")).toBe(false);
    const storedPath: string = join(rootDir, key);
    expect(existsSync(storedPath)).toBe(true);
    await store.delete(key);
    expect(existsSync(storedPath)).toBe(false);
  });

  it("rejects empty bytes and does not persist a path", async () => {
    // Break: empty upload writes a key.
    const rootDir: string = mkdtempSync(join(tmpdir(), "gk-objects-"));
    const { LocalDiskAdapter } = await import("@/internal/storage/local-disk-adapter");
    const store = new LocalDiskAdapter(rootDir);
    await expect(store.put("empty.png", new Uint8Array(), "image/png")).rejects.toThrow();
  });

  it("selects LocalDiskAdapter when S3_* is unset in Vitest", async () => {
    // Break: factory returns MinioAdapter or throws when S3_* is unset.
    const { ObjectStoreFactory } = await import("@/internal/storage/object-store-factory");
    const { LocalDiskAdapter } = await import("@/internal/storage/local-disk-adapter");
    const store = ObjectStoreFactory.create();
    expect(store).toBeInstanceOf(LocalDiskAdapter);
  });

  it("refuses keys that target dbruns-files or images.dbruns.com", async () => {
    // Break: adapter stores under the forbidden bucket/host.
    const rootDir: string = mkdtempSync(join(tmpdir(), "gk-objects-"));
    const { LocalDiskAdapter } = await import("@/internal/storage/local-disk-adapter");
    const store = new LocalDiskAdapter(rootDir);
    const bytes: Uint8Array = new Uint8Array([1, 2, 3]);
    await expect(store.put("../dbruns-files/x.png", bytes, "image/png")).rejects.toThrow();
    await expect(store.put("images.dbruns.com/x.png", bytes, "image/png")).rejects.toThrow();
  });
});
