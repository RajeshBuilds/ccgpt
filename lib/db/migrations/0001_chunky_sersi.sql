/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'document'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "document" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "workspace" ALTER COLUMN "document_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace" ALTER COLUMN "document_created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "workspace" ALTER COLUMN "document_created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_id_created_at_pk" PRIMARY KEY("id","created_at");