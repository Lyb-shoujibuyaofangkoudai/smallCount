PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`tag_id` text NOT NULL,
	`account_id` text NOT NULL,
	`attachment_ids` text,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`description` text,
	`transfer_account_id` text,
	`transaction_date` integer NOT NULL,
	`payment_method_id` text NOT NULL,
	`location` text,
	`notes` text,
	`receipt_image_url` text,
	`is_recurring` integer DEFAULT false,
	`recurring_rule` text,
	`is_confirmed` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transfer_account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_transactions`("id", "tag_id", "account_id", "attachment_ids", "type", "amount", "description", "transfer_account_id", "transaction_date", "payment_method_id", "location", "notes", "receipt_image_url", "is_recurring", "recurring_rule", "is_confirmed", "created_at", "updated_at") SELECT "id", "tag_id", "account_id", "attachment_ids", "type", "amount", "description", "transfer_account_id", "transaction_date", "payment_method_id", "location", "notes", "receipt_image_url", "is_recurring", "recurring_rule", "is_confirmed", "created_at", "updated_at" FROM `transactions`;--> statement-breakpoint
DROP TABLE `transactions`;--> statement-breakpoint
ALTER TABLE `__new_transactions` RENAME TO `transactions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;