PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_payment_methods` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon` text DEFAULT '',
	`is_default` integer DEFAULT false,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
INSERT INTO `__new_payment_methods`("id", "name", "icon", "is_default", "created_at", "updated_at") SELECT "id", "name", "icon", "is_default", "created_at", "updated_at" FROM `payment_methods`;--> statement-breakpoint
DROP TABLE `payment_methods`;--> statement-breakpoint
ALTER TABLE `__new_payment_methods` RENAME TO `payment_methods`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `accounts` ADD `is_archived` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `is_archived` integer DEFAULT false;