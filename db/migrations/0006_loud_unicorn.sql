PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_payment_methods` (
	`id` text PRIMARY KEY NOT NULL,
	`account_ids` text,
	`name` text NOT NULL,
	`icon` text DEFAULT '',
	`is_default` integer DEFAULT false,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
INSERT INTO `__new_payment_methods`("id", "account_ids", "name", "icon", "is_default", "created_at", "updated_at") SELECT "id", "account_ids", "name", "icon", "is_default", "created_at", "updated_at" FROM `payment_methods`;--> statement-breakpoint
DROP TABLE `payment_methods`;--> statement-breakpoint
ALTER TABLE `__new_payment_methods` RENAME TO `payment_methods`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`account_ids` text,
	`name` text NOT NULL,
	`color` text,
	`icon` text,
	`type` text NOT NULL,
	`is_default` integer DEFAULT false,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
INSERT INTO `__new_tags`("id", "account_ids", "name", "color", "icon", "type", "is_default", "created_at", "updated_at") SELECT "id", "account_ids", "name", "color", "icon", "type", "is_default", "created_at", "updated_at" FROM `tags`;--> statement-breakpoint
DROP TABLE `tags`;--> statement-breakpoint
ALTER TABLE `__new_tags` RENAME TO `tags`;