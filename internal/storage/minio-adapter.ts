import { createHash, createHmac } from "node:crypto";
import {
  assertObjectKeyAllowed,
  assertUploadPayload,
  ForbiddenObjectKeyError,
  objectKeyFor,
  type ObjectStoreProtocol,
} from "@/internal/storage/object-store";

const REQUIRED_BUCKET: string = "bd-files";

function sha256Hex(p_data: Buffer): string {
  return createHash("sha256").update(p_data).digest("hex");
}

function hmacSha256(p_key: Buffer | string, p_data: string): Buffer {
  return createHmac("sha256", p_key).update(p_data, "utf8").digest();
}

function signingKey(
  p_secret: string,
  p_dateStamp: string,
  p_region: string,
): Buffer {
  const kDate: Buffer = hmacSha256(`AWS4${p_secret}`, p_dateStamp);
  const kRegion: Buffer = hmacSha256(kDate, p_region);
  const kService: Buffer = hmacSha256(kRegion, "s3");
  return hmacSha256(kService, "aws4_request");
}

export class MinioAdapter implements ObjectStoreProtocol {
  public constructor(
    public p_endpoint: string,
    public p_bucket: string,
    public p_accessKey: string,
    public p_secretKey: string,
    public p_region: string,
    public p_forcePathStyle: boolean,
  ) {
    this.assertBucket();
  }

  public async put(
    p_fileName: string,
    p_bytes: Uint8Array,
    p_contentType: string,
  ): Promise<string> {
    this.assertBucket();
    assertUploadPayload(p_bytes, p_contentType);
    const key: string = objectKeyFor(p_fileName);
    await this.signed("PUT", key, Buffer.from(p_bytes), p_contentType);
    return key;
  }

  public async delete(p_key: string): Promise<void> {
    this.assertBucket();
    assertObjectKeyAllowed(p_key);
    await this.signed("DELETE", p_key, Buffer.alloc(0), "");
  }

  public publicUrl(p_key: string): string {
    const endpoint: URL = new URL(this.p_endpoint);
    if (this.p_forcePathStyle) {
      return `${endpoint.origin}/${this.p_bucket}/${p_key}`;
    }
    return `${endpoint.protocol}//${this.p_bucket}.${endpoint.host}/${p_key}`;
  }

  private assertBucket(): void {
    const loweredEndpoint: string = this.p_endpoint.toLowerCase();
    if (
      this.p_bucket !== REQUIRED_BUCKET ||
      loweredEndpoint.includes("dbruns-files") ||
      loweredEndpoint.includes("images.dbruns.com")
    ) {
      throw new ForbiddenObjectKeyError();
    }
  }

  private async signed(
    p_method: string,
    p_key: string,
    p_body: Buffer,
    p_contentType: string,
  ): Promise<void> {
    const endpoint: URL = new URL(this.p_endpoint);
    const encodedKey: string = p_key
      .split("/")
      .map((p_part: string) => encodeURIComponent(p_part))
      .join("/");
    const canonicalUri: string = this.p_forcePathStyle
      ? `/${this.p_bucket}/${encodedKey}`
      : `/${encodedKey}`;
    const host: string = this.p_forcePathStyle
      ? endpoint.host
      : `${this.p_bucket}.${endpoint.host}`;
    const now: Date = new Date();
    const amzDate: string = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const dateStamp: string = amzDate.slice(0, 8);
    const payloadHash: string = sha256Hex(p_body);
    const headers: Array<[string, string]> = [
      ["host", host],
      ["x-amz-content-sha256", payloadHash],
      ["x-amz-date", amzDate],
    ];
    if (p_contentType !== "") {
      headers.push(["content-type", p_contentType]);
    }
    headers.sort((p_a: [string, string], p_b: [string, string]) => p_a[0].localeCompare(p_b[0]));
    const signedHeaders: string = headers.map((p_h: [string, string]) => p_h[0]).join(";");
    const canonicalHeaders: string = headers
      .map((p_h: [string, string]) => `${p_h[0]}:${p_h[1]}\n`)
      .join("");
    const canonicalRequest: string = [
      p_method,
      canonicalUri,
      "",
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n");
    const credentialScope: string = `${dateStamp}/${this.p_region}/s3/aws4_request`;
    const stringToSign: string = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      sha256Hex(Buffer.from(canonicalRequest, "utf8")),
    ].join("\n");
    const signature: string = createHmac("sha256", signingKey(this.p_secretKey, dateStamp, this.p_region))
      .update(stringToSign, "utf8")
      .digest("hex");
    const authorization: string =
      `AWS4-HMAC-SHA256 Credential=${this.p_accessKey}/${credentialScope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`;
    const target: string = `${endpoint.origin}${canonicalUri}`;
    const requestHeaders: Record<string, string> = {
      Authorization: authorization,
    };
    for (const p_header of headers) {
      if (p_header[0] !== "host") {
        requestHeaders[p_header[0]] = p_header[1];
      }
    }
    const response: Response = await fetch(target, {
      method: p_method,
      headers: requestHeaders,
      body: p_method === "PUT" ? p_body : undefined,
    });
    if (!response.ok) {
      throw new Error("object store request failed");
    }
  }
}
