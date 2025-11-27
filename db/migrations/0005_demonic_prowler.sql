PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`balance` real DEFAULT 0,
	`currency` text DEFAULT 'CNY',
	`icon` text,
	`color` text,
	`account_number` text,
	`bank_name` text,
	`credit_limit` real DEFAULT 0,
	`billing_day` integer,
	`due_day` integer,
	`is_active` integer DEFAULT false,
	`is_default` integer DEFAULT false,
	`is_archived` integer DEFAULT false,
	`notes` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_accounts`("id", "user_id", "name", "type", "balance", "currency", "icon", "color", "account_number", "bank_name", "credit_limit", "billing_day", "due_day", "is_active", "is_default", "is_archived", "notes", "created_at", "updated_at") SELECT "id", "user_id", "name", "type", "balance", "currency", "icon", "color", "account_number", "bank_name", "credit_limit", "billing_day", "due_day", "is_active", "is_default", "is_archived", "notes", "created_at", "updated_at" FROM `accounts`;--> statement-breakpoint
DROP TABLE `accounts`;--> statement-breakpoint
ALTER TABLE `__new_accounts` RENAME TO `accounts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `payment_methods` ADD `account_ids` text NOT NULL;--> statement-breakpoint
ALTER TABLE `tags` ADD `account_ids` text NOT NULL;