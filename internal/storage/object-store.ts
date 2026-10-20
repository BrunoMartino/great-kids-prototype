export type ObjectPutInput = {
  fileName: string;
  bytes: Uint8Array;
  contentType: string;
};

export interface ObjectStoreFnProtocol {
  (p_input: ObjectPutInput): Promise<string>;
}

export interface ObjectStoreProtocol {
  put(p_fileName: string, p_bytes: Uint8Array, p_contentType: string): Promise<string>;
  delete(p_key: string): Promise<void>;
  publicUrl(p_key: string): string;
}

export class ObjectStoreStrategy {
  public constructor(public store: ObjectStoreProtocol) {}

  public async put(
    p_fileName: string,
    p_bytes: Uint8Array,
    p_contentType: string,
  ): Promise<string> {
    return this.store.put(p_fileName, p_bytes, p_contentType);
  }

  public async delete(p_key: string): Promise<void> {
    return this.store.delete(p_key);
  }

  public publicUrl(p_key: string): string {
    return this.store.publicUrl(p_key);
  }
}

export class ForbiddenObjectKeyError extends Error {
  public constructor() {
    super("forbidden object key");
    this.name = "ForbiddenObjectKeyError";
  }
}

export class EmptyUploadError extends Error {
  public constructor() {
    super("empty file");
    this.name = "EmptyUploadError";
  }
}

export class RejectedUploadTypeError extends Error {
  public constructor() {
    super("rejected type");
    this.name = "RejectedUploadTypeError";
  }
}

export function assertObjectKeyAllowed(p_fileName: string): void {
  const lowered: string = p_fileName.toLowerCase();
  if (
    p_fileName.includes("..") ||
    lowered.includes("dbruns-files") ||
    lowered.includes("images.dbruns.com")
  ) {
    throw new ForbiddenObjectKeyError();
  }
}

export function assertUploadPayload(p_bytes: Uint8Array, p_contentType: string): void {
  if (p_bytes.byteLength === 0) {
    throw new EmptyUploadError();
  }
  const allowed: boolean =
    p_contentType.startsWith("image/") || p_contentType === "application/pdf";
  if (!allowed) {
    throw new RejectedUploadTypeError();
  }
}

export function objectKeyFor(p_fileName: string): string {
  assertObjectKeyAllowed(p_fileName);
  const slash: number = Math.max(p_fileName.lastIndexOf("/"), p_fileName.lastIndexOf("\\"));
  const base: string = slash >= 0 ? p_fileName.slice(slash + 1) : p_fileName;
  const safe: string = base.replace(/[^a-zA-Z0-9._-]/g, "_");
  const named: string = safe === "" ? "object.bin" : safe;
  return `great-kids/${crypto.randomUUID()}/${named}`;
}

export type ParsedUpload = {
  fileName: string;
  bytes: Uint8Array;
  contentType: string;
};

export async function parseUploadFile(p_request: Request): Promise<ParsedUpload> {
  const form: FormData = await p_request.formData();
  const file: FormDataEntryValue | null = form.get("file");
  if (file === null || typeof file === "string") {
    throw new EmptyUploadError();
  }
  const blob: Blob = file;
  const buffer: ArrayBuffer = await blob.arrayBuffer();
  const bytes: Uint8Array = new Uint8Array(buffer);
  const fileName: string = file instanceof File && file.name !== "" ? file.name : "object.bin";
  const contentType: string = blob.type === "" ? "application/octet-stream" : blob.type;
  return { fileName, bytes, contentType };
}
