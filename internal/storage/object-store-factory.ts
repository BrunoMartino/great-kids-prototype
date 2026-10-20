import { tmpdir } from "node:os";
import { join } from "node:path";
import { LocalDiskAdapter } from "@/internal/storage/local-disk-adapter";
import { MinioAdapter } from "@/internal/storage/minio-adapter";
import { type ObjectStoreProtocol } from "@/internal/storage/object-store";

export class MissingS3EnvError extends Error {
  public constructor() {
    super("S3 env missing");
    this.name = "MissingS3EnvError";
  }
}

function s3Configured(): boolean {
  const endpoint: string | undefined = process.env.S3_ENDPOINT;
  const bucket: string | undefined = process.env.S3_BUCKET;
  const accessKey: string | undefined = process.env.S3_ACCESS_KEY;
  const secretKey: string | undefined = process.env.S3_SECRET_KEY;
  return (
    endpoint !== undefined &&
    endpoint !== "" &&
    bucket !== undefined &&
    bucket !== "" &&
    accessKey !== undefined &&
    accessKey !== "" &&
    secretKey !== undefined &&
    secretKey !== ""
  );
}

export abstract class ObjectStoreFactory {
  public abstract getStore(): ObjectStoreProtocol;

  public create(): ObjectStoreProtocol {
    return this.getStore();
  }

  public static create(): ObjectStoreProtocol {
    return new EnvObjectStoreFactory().getStore();
  }
}

export class EnvObjectStoreFactory extends ObjectStoreFactory {
  public getStore(): ObjectStoreProtocol {
    if (s3Configured()) {
      return new MinioAdapter(
        process.env.S3_ENDPOINT ?? "",
        process.env.S3_BUCKET ?? "",
        process.env.S3_ACCESS_KEY ?? "",
        process.env.S3_SECRET_KEY ?? "",
        process.env.S3_REGION ?? "us-east-1",
        process.env.S3_FORCE_PATH_STYLE !== "false",
      );
    }
    const vitest: string | undefined = process.env.VITEST;
    if (vitest !== undefined && vitest !== "") {
      const rootDir: string = join(tmpdir(), "great-kids-objects");
      return new LocalDiskAdapter(rootDir);
    }
    throw new MissingS3EnvError();
  }
}
