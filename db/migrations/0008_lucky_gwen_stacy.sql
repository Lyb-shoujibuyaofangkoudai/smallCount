ALTER TABLE `attachments` RENAME COLUMN "uploaded_at" TO "created_at";--> statement-breakpoint
ALTER TABLE `attachments` ADD `updated_at` integer DEFAULT (strftime('%s', 'now'));