CREATE TABLE `catalog_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category` text NOT NULL,
	`name` text NOT NULL,
	`prompt_en` text NOT NULL,
	`prompt_zh` text NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`gender` text NOT NULL,
	`image` text NOT NULL,
	`thumb` text NOT NULL,
	`image_aspect_ratio` real,
	`thumb_aspect_ratio` real,
	`skeleton` text,
	`deprecated` integer DEFAULT false NOT NULL,
	CONSTRAINT "catalog_items_category_check" CHECK("catalog_items"."category" IN ('hair','body','pose')),
	CONSTRAINT "catalog_items_gender_check" CHECK("catalog_items"."gender" IN ('female','male','any')),
	CONSTRAINT "catalog_items_name_check" CHECK(length("catalog_items"."name") > 0),
	CONSTRAINT "catalog_items_prompt_en_check" CHECK(length("catalog_items"."prompt_en") > 0),
	CONSTRAINT "catalog_items_prompt_zh_check" CHECK(length("catalog_items"."prompt_zh") > 0),
	CONSTRAINT "catalog_items_tags_check" CHECK(json_valid("catalog_items"."tags")),
	CONSTRAINT "catalog_items_image_check" CHECK(length("catalog_items"."image") > 0),
	CONSTRAINT "catalog_items_thumb_check" CHECK(length("catalog_items"."thumb") > 0),
	CONSTRAINT "catalog_items_image_ratio_check" CHECK("catalog_items"."image_aspect_ratio" IS NULL OR "catalog_items"."image_aspect_ratio" > 0),
	CONSTRAINT "catalog_items_thumb_ratio_check" CHECK("catalog_items"."thumb_aspect_ratio" IS NULL OR "catalog_items"."thumb_aspect_ratio" > 0),
	CONSTRAINT "catalog_items_skeleton_check" CHECK("catalog_items"."skeleton" IS NULL OR "catalog_items"."category" = 'pose')
);
--> statement-breakpoint
CREATE INDEX `catalog_items_category_idx` ON `catalog_items` (`category`,`deprecated`);