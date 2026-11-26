import { describe, expect, test } from "bun:test";
import { createImageKey, sniffImageExtension } from "./image";
import { createItemSchema } from "./schema";

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0];
const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0];
const WEBP = [0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50];
const GIF = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0, 0, 0, 0, 0, 0];

describe("sniffImageExtension", () => {
  test("按文件头识别 png、jpg、webp", () => {
    expect(sniffImageExtension(new Uint8Array(PNG))).toBe("png");
    expect(sniffImageExtension(new Uint8Array(JPEG))).toBe("jpg");
    expect(sniffImageExtension(new Uint8Array(WEBP))).toBe("webp");
  });

  test("拒绝其他格式、伪装的内容和空文件", () => {
    expect(sniffImageExtension(new Uint8Array(GIF))).toBeUndefined();
    expect(sniffImageExtension(new Uint8Array(0))).toBeUndefined();
    // RIFF 容器但不是 WEBP（例如 WAV）
    const wav = [0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x41, 0x56, 0x45];
    expect(sniffImageExtension(new Uint8Array(wav))).toBeUndefined();
  });
});

describe("createImageKey", () => {
  test("生成的 key 能通过 schema 的 key 校验，且每次不同", () => {
    const first = createImageKey("png");
    const second = createImageKey("png");
    expect(first).not.toBe(second);
    for (const extension of ["png", "jpg", "webp"] as const) {
      const key = createImageKey(extension);
      const result = createItemSchema.safeParse({
        category: "hair",
        gender: "any",
        image: { aspectRatio: 1, key },
        name: "a",
        promptEn: "a",
        promptZh: "a",
        tags: [],
      });
      expect(result.success).toBe(true);
    }
  });
});
