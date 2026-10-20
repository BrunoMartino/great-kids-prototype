import { describe, expect, it } from "vitest";

describe("ImageAdapter", () => {
  it("maps objectKey to img_path", async () => {
    // Break: Adapter rewrites or prefixes the object key.
    const { ImageAdapter } = await import("@/app/api/missions/[id]/image-adapter");
    const imgPath: string = ImageAdapter.toImgPath({ objectKey: "missions/boats.jpg" });
    expect(imgPath).toBe("missions/boats.jpg");
  });

  it("maps an empty objectKey to an empty string", async () => {
    // Break: empty key becomes a fabricated path.
    const { ImageAdapter } = await import("@/app/api/missions/[id]/image-adapter");
    const imgPath: string = ImageAdapter.toImgPath({ objectKey: "" });
    expect(imgPath).toBe("");
  });

  it("does not throw for a normal object key", async () => {
    // Break: Adapter performs IO or validation that throws on a plain key.
    const { ImageAdapter } = await import("@/app/api/missions/[id]/image-adapter");
    expect(() => {
      ImageAdapter.toImgPath({ objectKey: "missions/boats.jpg" });
    }).not.toThrow();
  });

  it("stores a traversal-shaped objectKey as data without filesystem IO", async () => {
    // Break: Adapter resolves or rejects the path against the filesystem.
    const { ImageAdapter } = await import("@/app/api/missions/[id]/image-adapter");
    const imgPath: string = ImageAdapter.toImgPath({
      objectKey: "missions/../../etc/passwd",
    });
    expect(imgPath).toBe("missions/../../etc/passwd");
  });
});
