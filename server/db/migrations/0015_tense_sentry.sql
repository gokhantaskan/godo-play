ALTER TABLE "platform_group_platforms" DROP CONSTRAINT "platform_group_platforms_platform_id_platforms_id_fk";
--> statement-breakpoint
ALTER TABLE "platform_group_platforms" ADD CONSTRAINT "platform_group_platforms_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "submission_id_idx" ON "platform_groups" USING btree ("submission_id");