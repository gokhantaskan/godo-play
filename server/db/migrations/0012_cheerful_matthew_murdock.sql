ALTER TABLE "store_supported_platforms" DROP CONSTRAINT "store_supported_platforms_store_id_stores_id_fk";
--> statement-breakpoint
ALTER TABLE "store_supported_platforms" DROP CONSTRAINT "store_supported_platforms_platform_id_platforms_id_fk";
--> statement-breakpoint
ALTER TABLE "store_supported_platforms" ADD CONSTRAINT "store_supported_platforms_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE cascade;
--> statement-breakpoint
ALTER TABLE "store_supported_platforms" ADD CONSTRAINT "store_supported_platforms_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE cascade ON UPDATE cascade;
--> statement-breakpoint
ALTER TABLE "game_submission_game_modes" DROP CONSTRAINT "game_submission_game_modes_game_mode_id_game_modes_id_fk";
--> statement-breakpoint
ALTER TABLE "game_submission_game_modes" ADD CONSTRAINT "game_submission_game_modes_game_mode_id_game_modes_id_fk" FOREIGN KEY ("game_mode_id") REFERENCES "public"."game_modes"("id") ON DELETE cascade ON UPDATE cascade;