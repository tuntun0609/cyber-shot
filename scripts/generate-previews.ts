import { mkdir, rm } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import sharp from "sharp";
import { getItems } from "../src/lib/catalog";
import { getPreviewPath, PREVIEW_DIRECTORY } from "../src/lib/catalog/preview";
import { CATEGORIES } from "../src/lib/catalog/schema";

const publicDir = resolve(import.meta.dirname, "../public");
const items = CATEGORIES.flatMap(getItems);
await rm(resolve(publicDir, PREVIEW_DIRECTORY), {
  force: true,
  recursive: true,
});

await Promise.all(
  items.map(async (item) => {
    const preview = getPreviewPath(item);
    if (!preview) {
      return;
    }
    const source = resolve(publicDir, `.${item.image}`);
    if (!source.startsWith(`${publicDir}${sep}`)) {
      throw new Error(`本地素材路径必须位于 public 目录中：${item.image}`);
    }
    const destination = resolve(publicDir, `.${preview}`);
    await mkdir(dirname(destination), { recursive: true });
    await sharp(source)
      .rotate()
      .resize({
        fit: "inside",
        height: 1280,
        width: 1280,
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toFile(destination);
  })
);
