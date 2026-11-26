import { describe, expect, test } from "bun:test";
import { createItemSchema, updateItemSchema } from "./schema";

const IMAGE_KEY = "cyber-shot/123e4567-e89b-12d3-a456-426614174000.png";
const SKELETON_KEY = "cyber-shot/123e4567-e89b-12d3-a456-426614174001.webp";

const base = {
  category: "pose",
  gender: "any",
  image: { aspectRatio: 0.8, key: IMAGE_KEY },
  name: "站姿",
  promptEn: "standing",
  promptZh: "站立",
  tags: ["日常"],
};

const ok = (input: unknown) => createItemSchema.safeParse(input).success;

describe("createItemSchema", () => {
  test("接受合法输入，并去掉文本首尾空白", () => {
    const result = createItemSchema.parse({ ...base, name: "  站姿  " });
    expect(result.name).toBe("站姿");
  });

  test("标签去重并保持输入顺序", () => {
    const result = createItemSchema.parse({
      ...base,
      tags: ["b", "a", "b", "a"],
    });
    expect(result.tags).toEqual(["b", "a"]);
  });

  test("标签最多 10 个，每个最长 20 字", () => {
    const eleven = Array.from({ length: 11 }, (_, index) => `t${index}`);
    expect(ok({ ...base, tags: eleven })).toBe(false);
    expect(ok({ ...base, tags: ["x".repeat(21)] })).toBe(false);
    expect(ok({ ...base, tags: ["x".repeat(20)] })).toBe(true);
  });

  test("名称 1 到 50 字，纯空白视为空", () => {
    expect(ok({ ...base, name: "   " })).toBe(false);
    expect(ok({ ...base, name: "a".repeat(51) })).toBe(false);
    expect(ok({ ...base, name: "a".repeat(50) })).toBe(true);
  });

  test("提示词不超过 1000 字且非空", () => {
    expect(ok({ ...base, promptEn: "a".repeat(1001) })).toBe(false);
    expect(ok({ ...base, promptZh: "" })).toBe(false);
    expect(ok({ ...base, promptZh: "字".repeat(1000) })).toBe(true);
  });

  test("图片 key 只接受上传接口生成的格式", () => {
    for (const key of [
      "../secret.png",
      "other/123e4567-e89b-12d3-a456-426614174000.png",
      "cyber-shot/abc.png",
      "cyber-shot/123e4567-e89b-12d3-a456-426614174000.gif",
    ]) {
      expect(ok({ ...base, image: { aspectRatio: 0.8, key } })).toBe(false);
    }
  });

  test("宽高比必须为正数", () => {
    expect(ok({ ...base, image: { aspectRatio: 0, key: IMAGE_KEY } })).toBe(
      false
    );
  });

  test("骨架图只允许动作类别", () => {
    expect(ok({ ...base, skeleton: SKELETON_KEY })).toBe(true);
    expect(ok({ ...base, category: "hair", skeleton: SKELETON_KEY })).toBe(
      false
    );
    expect(ok({ ...base, category: "hair" })).toBe(true);
  });

  test("类别和性别只接受枚举值", () => {
    expect(ok({ ...base, category: "other" })).toBe(false);
    expect(ok({ ...base, gender: "unknown" })).toBe(false);
  });
});

describe("updateItemSchema", () => {
  const { category: _category, image: _image, ...fields } = base;
  const update = { ...fields, id: 1 };
  const okUpdate = (input: unknown) =>
    updateItemSchema.safeParse(input).success;

  test("image 和 skeleton 都可以省略，表示保留原值", () => {
    expect(okUpdate(update)).toBe(true);
  });

  test("skeleton 为 null 表示清除，字符串表示替换", () => {
    expect(okUpdate({ ...update, skeleton: null })).toBe(true);
    expect(okUpdate({ ...update, skeleton: SKELETON_KEY })).toBe(true);
    expect(okUpdate({ ...update, skeleton: "../x.webp" })).toBe(false);
  });

  test("id 必须是正整数", () => {
    expect(okUpdate({ ...update, id: 0 })).toBe(false);
    expect(okUpdate({ ...update, id: 1.5 })).toBe(false);
  });
});
