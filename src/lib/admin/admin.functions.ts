import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getBucket, getDb } from "../../db/client";
import { catalogItems } from "../../db/schema";
import { getAllViews, toView } from "../catalog";
import { CONTENT_TYPES, createImageKey, sniffImageExtension } from "./image";
import { adminMiddleware } from "./middleware";
import {
  createItemSchema,
  MAX_IMAGE_BYTES,
  setDeprecatedSchema,
  updateItemSchema,
} from "./schema";

// 提交的 key 必须真实存在于 bucket，避免数据库指向不存在的图片
async function assertKeysExist(keys: (string | null | undefined)[]) {
  const bucket = await getBucket();
  const present = [...new Set(keys)].filter((key): key is string => !!key);
  const results = await Promise.all(
    present.map(async (key) => ({ exists: !!(await bucket.head(key)), key }))
  );
  const missing = results.find((result) => !result.exists);
  if (missing) {
    throw new Error(`图片不存在：${missing.key}`);
  }
}

// 旧图删除失败不影响本次保存，只留下孤儿文件
async function deleteObjects(keys: (string | null | undefined)[]) {
  const stale = [...new Set(keys)].filter((key): key is string => !!key);
  if (stale.length === 0) {
    return;
  }
  try {
    await (await getBucket()).delete(stale);
  } catch (error) {
    console.error("删除旧图片失败", stale, error);
  }
}

export const loadAdminItems = createServerFn()
  .middleware([adminMiddleware])
  .handler(() => getAllViews());

export const loadAdminItem = createServerFn()
  .middleware([adminMiddleware])
  .validator((id: number) => updateItemSchema.shape.id.parse(id))
  .handler(async ({ data: id }) => {
    const db = await getDb();
    const [row] = await db
      .select()
      .from(catalogItems)
      .where(eq(catalogItems.id, id))
      .limit(1);
    if (!row) {
      throw new Error("素材不存在");
    }
    return toView(row);
  });

export const uploadImage = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((data: FormData) => {
    const file = data instanceof FormData ? data.get("file") : null;
    if (!(file instanceof File)) {
      throw new Error("缺少图片文件");
    }
    return file;
  })
  .handler(async ({ data: file }) => {
    if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
      throw new Error("图片大小需在 10 MB 以内");
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const extension = sniffImageExtension(bytes);
    if (!extension) {
      throw new Error("只支持 png、jpg、webp 图片");
    }
    const key = createImageKey(extension);
    await (await getBucket()).put(key, bytes, {
      httpMetadata: { contentType: CONTENT_TYPES[extension] },
    });
    return { key };
  });

export const createItem = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) => createItemSchema.parse(input))
  .handler(async ({ data }) => {
    await assertKeysExist([data.image.key, data.skeleton]);
    const now = new Date();
    const db = await getDb();
    const [created] = await db
      .insert(catalogItems)
      .values({
        category: data.category,
        createdAt: now,
        gender: data.gender,
        image: data.image.key,
        imageAspectRatio: data.image.aspectRatio,
        name: data.name,
        promptEn: data.promptEn,
        promptZh: data.promptZh,
        skeleton: data.skeleton ?? null,
        tags: data.tags,
        thumb: data.image.key,
        thumbAspectRatio: data.image.aspectRatio,
        updatedAt: now,
      })
      .returning({ id: catalogItems.id });
    return { id: created.id };
  });

export const updateItem = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) => updateItemSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await getDb();
    const [old] = await db
      .select()
      .from(catalogItems)
      .where(eq(catalogItems.id, data.id))
      .limit(1);
    if (!old) {
      throw new Error("素材不存在");
    }
    if (data.skeleton && old.category !== "pose") {
      throw new Error("只有动作可以设置骨架图");
    }
    await assertKeysExist([data.image?.key, data.skeleton]);

    // skeleton：undefined 保留，null 清除，字符串替换
    const skeleton = data.skeleton === undefined ? old.skeleton : data.skeleton;
    await db
      .update(catalogItems)
      .set({
        gender: data.gender,
        name: data.name,
        promptEn: data.promptEn,
        promptZh: data.promptZh,
        skeleton,
        tags: data.tags,
        updatedAt: new Date(),
        ...(data.image && {
          image: data.image.key,
          imageAspectRatio: data.image.aspectRatio,
          thumb: data.image.key,
          thumbAspectRatio: data.image.aspectRatio,
        }),
      })
      .where(eq(catalogItems.id, data.id));

    // 数据库已指向新图，再清理被替换的旧对象
    await deleteObjects([
      ...(data.image ? [old.image, old.thumb] : []),
      ...(skeleton === old.skeleton ? [] : [old.skeleton]),
    ]);
    return { id: data.id };
  });

export const setDeprecated = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: unknown) => setDeprecatedSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await getDb();
    await db
      .update(catalogItems)
      .set({ deprecated: data.deprecated, updatedAt: new Date() })
      .where(eq(catalogItems.id, data.id));
    return { id: data.id };
  });
