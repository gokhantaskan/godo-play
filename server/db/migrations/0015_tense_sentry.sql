ALTER TABLE "platform_group_platforms" DROP CONSTRAINT "platform_group_platforms_platform_id_platforms_id_fk";
--> statement-breakpoint
ALTER TABLE "platform_group_platforms" ADD CONSTRAINT "platform_group_platforms_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'submission_id_idx' 
        AND tablename = 'platform_groups'
    ) THEN
        CREATE INDEX "submission_id_idx" ON "platform_groups" USING btree ("submission_id");
    END IF;
END $$;