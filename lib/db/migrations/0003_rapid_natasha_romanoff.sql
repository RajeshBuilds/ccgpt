ALTER TABLE "complaint" RENAME COLUMN "category_id" TO "category";--> statement-breakpoint
ALTER TABLE "complaint" RENAME COLUMN "sub_category_id" TO "sub_category";--> statement-breakpoint
ALTER TABLE "complaint" DROP CONSTRAINT "complaint_category_id_complaint_category_id_fk";
--> statement-breakpoint
ALTER TABLE "complaint" DROP CONSTRAINT "complaint_sub_category_id_complaint_sub_category_id_fk";
--> statement-breakpoint
ALTER TABLE "complaint" ADD COLUMN "additional_details" text;--> statement-breakpoint
ALTER TABLE "complaint" DROP COLUMN "preferred_contact_method";--> statement-breakpoint
ALTER TABLE "complaint" DROP COLUMN "preferred_contact_info";--> statement-breakpoint
ALTER TABLE "complaint" DROP COLUMN "preferred_contact_time";--> statement-breakpoint
ALTER TABLE "complaint" DROP COLUMN "incident_date";--> statement-breakpoint
ALTER TABLE "complaint" DROP COLUMN "incident_time";--> statement-breakpoint
ALTER TABLE "complaint" DROP COLUMN "transaction_reference";--> statement-breakpoint
ALTER TABLE "complaint" DROP COLUMN "transaction_amount";--> statement-breakpoint
ALTER TABLE "complaint" DROP COLUMN "product_details";--> statement-breakpoint
ALTER TABLE "complaint" DROP COLUMN "device_details";--> statement-breakpoint
ALTER TABLE "complaint" DROP COLUMN "app_details";--> statement-breakpoint
ALTER TABLE "complaint" DROP COLUMN "browser_details";--> statement-breakpoint
ALTER TABLE "complaint" DROP COLUMN "branch_details";--> statement-breakpoint
ALTER TABLE "complaint" DROP COLUMN "branch_employee";--> statement-breakpoint
ALTER TABLE "complaint" DROP COLUMN "atm_location";--> statement-breakpoint
ALTER TABLE "complaint" DROP COLUMN "fraud_details";--> statement-breakpoint
ALTER TABLE "complaint" DROP COLUMN "fraud_type";--> statement-breakpoint
ALTER TABLE "complaint" DROP COLUMN "fraud_amount";