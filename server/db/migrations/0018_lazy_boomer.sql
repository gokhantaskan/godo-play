CREATE INDEX "game_modes_name_idx" ON "game_modes" USING btree ("name");--> statement-breakpoint
CREATE INDEX "gm_gm_game_mode_id_idx" ON "game_submission_game_modes" USING btree ("game_mode_id");--> statement-breakpoint
CREATE INDEX "games_category_idx" ON "games" USING btree ("category");--> statement-breakpoint
CREATE INDEX "games_name_idx" ON "games" USING btree ("name");--> statement-breakpoint
CREATE INDEX "games_status_idx" ON "games" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pgp_platform_id_idx" ON "platform_group_platforms" USING btree ("platform_id");--> statement-breakpoint
CREATE INDEX "platforms_name_idx" ON "platforms" USING btree ("name");--> statement-breakpoint
CREATE INDEX "platforms_abbreviation_idx" ON "platforms" USING btree ("abbreviation");--> statement-breakpoint
CREATE INDEX "scp_platform_id_idx" ON "store_crossplay_platforms" USING btree ("platform_id");--> statement-breakpoint
CREATE INDEX "sp_submission_id_idx" ON "store_platforms" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "sp_store_slug_idx" ON "store_platforms" USING btree ("store_slug");--> statement-breakpoint
CREATE INDEX "ssp_platform_id_idx" ON "store_supported_platforms" USING btree ("platform_id");--> statement-breakpoint
CREATE INDEX "stores_name_idx" ON "stores" USING btree ("name");--> statement-breakpoint
CREATE INDEX "games_tags_tag_id_idx" ON "games_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "tags_name_idx" ON "tags" USING btree ("name");