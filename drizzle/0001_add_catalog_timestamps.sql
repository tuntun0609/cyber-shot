ALTER TABLE `catalog_items` ADD `created_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `catalog_items` ADD `updated_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE `catalog_items` SET `created_at` = CAST(strftime('%s','now') AS integer) * 1000, `updated_at` = CAST(strftime('%s','now') AS integer) * 1000 WHERE `created_at` = 0;