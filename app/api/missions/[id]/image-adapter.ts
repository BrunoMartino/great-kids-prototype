export type ImageObjectKeyInput = {
  objectKey: string;
};

export interface ImagePathFnProtocol {
  (p_input: ImageObjectKeyInput): string;
}

export interface ImagePathProtocol {
  toImgPath: ImagePathFnProtocol;
}

export class ImageAdapter implements ImagePathProtocol {
  public toImgPath(p_input: ImageObjectKeyInput): string {
    return p_input.objectKey;
  }

  public static toImgPath(p_input: ImageObjectKeyInput): string {
    const adapter: ImageAdapter = new ImageAdapter();
    return adapter.toImgPath(p_input);
  }
}
