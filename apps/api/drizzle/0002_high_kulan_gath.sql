ALTER TABLE "organization" ADD COLUMN "timezone" text DEFAULT 'UTC';--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "check_in_time" text DEFAULT '15:00';--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "check_out_time" text DEFAULT '11:00';--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "contact_email" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "currency" text DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_super_admin" boolean DEFAULT false;