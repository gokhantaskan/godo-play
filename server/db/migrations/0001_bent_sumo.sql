ALTER TABLE "pc_store_crossplay_platforms" DROP CONSTRAINT "pc_store_crossplay_platforms_pc_store_platform_id_pc_store_platforms_id_fk";
--> statement-breakpoint
ALTER TABLE "pc_store_platforms" DROP CONSTRAINT "pc_store_platforms_submission_id_game_submissions_id_fk";
--> statement-breakpoint
ALTER TABLE "platform_group_platforms" DROP CONSTRAINT "platform_group_platforms_platform_group_id_platform_groups_id_fk";
--> statement-breakpoint
ALTER TABLE "platform_groups" DROP CONSTRAINT "platform_groups_submission_id_game_submissions_id_fk";
--> statement-breakpoint
ALTER TABLE "pc_store_crossplay_platforms" ADD CONSTRAINT "pc_store_crossplay_platforms_pc_store_platform_id_pc_store_platforms_id_fk" FOREIGN KEY ("pc_store_platform_id") REFERENCES "public"."pc_store_platforms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_store_platforms" ADD CONSTRAINT "pc_store_platforms_submission_id_game_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."game_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_group_platforms" ADD CONSTRAINT "platform_group_platforms_platform_group_id_platform_groups_id_fk" FOREIGN KEY ("platform_group_id") REFERENCES "public"."platform_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_groups" ADD CONSTRAINT "platform_groups_submission_id_game_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."game_submissions"("id") ON DELETE cascade ON UPDATE no action;