import type { ImageExtension } from "./schema";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const RIFF_SIGNATURE = [0x52, 0x49, 0x46, 0x46];
const WEBP_SIGNATURE = [0x57, 0x45, 0x42, 0x50];
const WEBP_OFFSET = 8;

export const CONTENT_TYPES: Record<ImageExtension, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function hasSignature(
  bytes: Uint8Array,
  signature: readonly number[],
  offset = 0
): boolean {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

// 按文件头判断真实类型，不信任浏览器给的 Content-Type 和文件名
export function sniffImageExtension(
  bytes: Uint8Array
): ImageExtension | undefined {
  if (hasSignature(bytes, PNG_SIGNATURE)) {
    return "png";
  }
  if (hasSignature(bytes, JPEG_SIGNATURE)) {
    return "jpg";
  }
  if (
    hasSignature(bytes, RIFF_SIGNATURE) &&
    hasSignature(bytes, WEBP_SIGNATURE, WEBP_OFFSET)
  ) {
    return "webp";
  }
  return undefined;
}

// 每次上传都生成新的 uuid key：同一个 key 会被 CDN 和图片变换缓存，覆盖写前台看不到变化
export function createImageKey(extension: ImageExtension): string {
  return `cyber-shot/${crypto.randomUUID()}.${extension}`;
}
