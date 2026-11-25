import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getAllViews, getItem, toView } from ".";
import { isCategory } from "./view";

export const loadCatalog = createServerFn().handler(() => getAllViews());

const itemParams = z.object({ category: z.string(), id: z.string() });

export const loadCatalogItem = createServerFn()
  .validator((params: { category: string; id: string }) => {
    const parsed = itemParams.safeParse(params);
    if (!parsed.success) {
      throw notFound();
    }
    return parsed.data;
  })
  .handler(({ data }) => {
    const { category, id } = data;
    const item = isCategory(category) ? getItem(category, id) : undefined;
    if (!item) {
      throw notFound();
    }
    return toView(item);
  });
