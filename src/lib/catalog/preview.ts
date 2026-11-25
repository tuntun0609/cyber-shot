import type { CatalogItem } from "./schema";

export const PREVIEW_DIRECTORY = "catalog-previews";

const LOCAL_RASTER = /^\/(?!\/).+\.(?:avif|jpe?g|png|webp)$/iu;

export function getPreviewPath({ category, id, image }: CatalogItem) {
  return LOCAL_RASTER.test(image)
    ? `/${PREVIEW_DIRECTORY}/${category}/${id}.webp`
    : undefined;
}
