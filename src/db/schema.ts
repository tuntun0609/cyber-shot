import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const catalogItems = sqliteTable(
  "catalog_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    category: text("category", { enum: ["hair", "body", "pose"] }).notNull(),
    name: text("name").notNull(),
    promptEn: text("prompt_en").notNull(),
    promptZh: text("prompt_zh").notNull(),
    tags: text("tags", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    gender: text("gender", { enum: ["female", "male", "any"] }).notNull(),
    image: text("image").notNull(),
    thumb: text("thumb").notNull(),
    imageAspectRatio: real("image_aspect_ratio"),
    thumbAspectRatio: real("thumb_aspect_ratio"),
    skeleton: text("skeleton"),
    deprecated: integer("deprecated", { mode: "boolean" })
      .notNull()
      .default(false),
    // 毫秒时间戳；默认值 0 仅用于迁移已有行，写入时由服务端显式设置
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`0`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`0`),
  },
  (table) => [
    index("catalog_items_category_idx").on(table.category, table.deprecated),
    check(
      "catalog_items_category_check",
      sql`${table.category} IN ('hair','body','pose')`
    ),
    check(
      "catalog_items_gender_check",
      sql`${table.gender} IN ('female','male','any')`
    ),
    check("catalog_items_name_check", sql`length(${table.name}) > 0`),
    check("catalog_items_prompt_en_check", sql`length(${table.promptEn}) > 0`),
    check("catalog_items_prompt_zh_check", sql`length(${table.promptZh}) > 0`),
    check("catalog_items_tags_check", sql`json_valid(${table.tags})`),
    check("catalog_items_image_check", sql`length(${table.image}) > 0`),
    check("catalog_items_thumb_check", sql`length(${table.thumb}) > 0`),
    check(
      "catalog_items_image_ratio_check",
      sql`${table.imageAspectRatio} IS NULL OR ${table.imageAspectRatio} > 0`
    ),
    check(
      "catalog_items_thumb_ratio_check",
      sql`${table.thumbAspectRatio} IS NULL OR ${table.thumbAspectRatio} > 0`
    ),
    check(
      "catalog_items_skeleton_check",
      sql`${table.skeleton} IS NULL OR ${table.category} = 'pose'`
    ),
  ]
);

export type CatalogRow = typeof catalogItems.$inferSelect;
