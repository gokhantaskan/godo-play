-- 1. Rename tables
ALTER TABLE "game_categories" RENAME TO "game_category";--> statement-breakpoint
ALTER TABLE "game_modes" RENAME TO "game_mode";--> statement-breakpoint
ALTER TABLE "game_submission_game_modes" RENAME TO "game_submission_game_mode";--> statement-breakpoint
ALTER TABLE "games" RENAME TO "game";--> statement-breakpoint
ALTER TABLE "platform_group_platforms" RENAME TO "platform_group_platform";--> statement-breakpoint
ALTER TABLE "platform_groups" RENAME TO "platform_group";--> statement-breakpoint
ALTER TABLE "platforms" RENAME TO "platform";--> statement-breakpoint
ALTER TABLE "store_crossplay_platforms" RENAME TO "store_crossplay_platform";--> statement-breakpoint
ALTER TABLE "store_platforms" RENAME TO "store_platform";--> statement-breakpoint
ALTER TABLE "store_supported_platforms" RENAME TO "store_supported_platform";--> statement-breakpoint
ALTER TABLE "stores" RENAME TO "store";--> statement-breakpoint
ALTER TABLE "games_tags" RENAME TO "game_tag";--> statement-breakpoint
ALTER TABLE "tags" RENAME TO "tag";--> statement-breakpoint

-- 2. Drop foreign keys (must happen before dropping the unique constraints they depend on)
ALTER TABLE "crossplay_information" DROP CONSTRAINT "crossplay_information_game_id_games_id_fk";
--> statement-breakpoint
ALTER TABLE "game_submission_game_mode" DROP CONSTRAINT "game_submission_game_modes_submission_id_games_id_fk";
--> statement-breakpoint
ALTER TABLE "game_submission_game_mode" DROP CONSTRAINT "game_submission_game_modes_game_mode_id_game_modes_id_fk";
--> statement-breakpoint
ALTER TABLE "game" DROP CONSTRAINT "games_category_game_categories_pointer_fk";
--> statement-breakpoint
ALTER TABLE "platform_group_platform" DROP CONSTRAINT "platform_group_platforms_platform_group_id_platform_groups_id_fk";
--> statement-breakpoint
ALTER TABLE "platform_group_platform" DROP CONSTRAINT "platform_group_platforms_platform_id_platforms_id_fk";
--> statement-breakpoint
ALTER TABLE "platform_group" DROP CONSTRAINT "platform_groups_submission_id_games_id_fk";
--> statement-breakpoint
ALTER TABLE "store_crossplay_platform" DROP CONSTRAINT "store_crossplay_platforms_store_platform_id_store_platforms_id_fk";
--> statement-breakpoint
ALTER TABLE "store_crossplay_platform" DROP CONSTRAINT "store_crossplay_platforms_platform_id_platforms_id_fk";
--> statement-breakpoint
ALTER TABLE "store_platform" DROP CONSTRAINT "store_platforms_submission_id_games_id_fk";
--> statement-breakpoint
ALTER TABLE "store_supported_platform" DROP CONSTRAINT "store_supported_platforms_store_id_stores_id_fk";
--> statement-breakpoint
ALTER TABLE "store_supported_platform" DROP CONSTRAINT "store_supported_platforms_platform_id_platforms_id_fk";
--> statement-breakpoint
ALTER TABLE "game_tag" DROP CONSTRAINT "games_tags_game_id_games_id_fk";
--> statement-breakpoint
ALTER TABLE "game_tag" DROP CONSTRAINT "games_tags_tag_id_tags_id_fk";
--> statement-breakpoint

-- 3. Drop old unique constraints
ALTER TABLE "crossplay_information" DROP CONSTRAINT "crossplay_information_game_id_unique";--> statement-breakpoint
ALTER TABLE "game_category" DROP CONSTRAINT "game_categories_pointer_unique";--> statement-breakpoint
ALTER TABLE "game_category" DROP CONSTRAINT "game_categories_slug_unique";--> statement-breakpoint
ALTER TABLE "game_mode" DROP CONSTRAINT "game_modes_slug_unique";--> statement-breakpoint
ALTER TABLE "game" DROP CONSTRAINT "games_slug_unique";--> statement-breakpoint
ALTER TABLE "platform" DROP CONSTRAINT "platforms_slug_unique";--> statement-breakpoint
ALTER TABLE "store" DROP CONSTRAINT "stores_slug_unique";--> statement-breakpoint
ALTER TABLE "tag" DROP CONSTRAINT "tags_slug_unique";--> statement-breakpoint

-- 4. Drop old indexes
DROP INDEX "game_modes_name_idx";--> statement-breakpoint
DROP INDEX "gm_gm_game_mode_id_idx";--> statement-breakpoint
DROP INDEX "games_category_idx";--> statement-breakpoint
DROP INDEX "games_name_idx";--> statement-breakpoint
DROP INDEX "games_status_idx";--> statement-breakpoint
DROP INDEX "games_release_date_idx";--> statement-breakpoint
DROP INDEX "games_created_at_idx";--> statement-breakpoint
DROP INDEX "games_updated_at_idx";--> statement-breakpoint
DROP INDEX "pgp_platform_id_idx";--> statement-breakpoint
DROP INDEX "submission_id_idx";--> statement-breakpoint
DROP INDEX "platforms_name_idx";--> statement-breakpoint
DROP INDEX "platforms_abbreviation_idx";--> statement-breakpoint
DROP INDEX "scp_platform_id_idx";--> statement-breakpoint
DROP INDEX "sp_submission_id_idx";--> statement-breakpoint
DROP INDEX "sp_store_slug_idx";--> statement-breakpoint
DROP INDEX "ssp_platform_id_idx";--> statement-breakpoint
DROP INDEX "stores_name_idx";--> statement-breakpoint
DROP INDEX "games_tags_tag_id_idx";--> statement-breakpoint
DROP INDEX "tags_name_idx";--> statement-breakpoint

-- 5. Drop old composite primary keys
ALTER TABLE "game_submission_game_mode" DROP CONSTRAINT "game_submission_game_modes_submission_id_game_mode_id_pk";--> statement-breakpoint
ALTER TABLE "platform_group_platform" DROP CONSTRAINT "platform_group_platforms_platform_group_id_platform_id_pk";--> statement-breakpoint
ALTER TABLE "store_crossplay_platform" DROP CONSTRAINT "store_crossplay_platforms_store_platform_id_platform_id_pk";--> statement-breakpoint
ALTER TABLE "store_supported_platform" DROP CONSTRAINT "store_supported_platforms_store_id_platform_id_pk";--> statement-breakpoint
ALTER TABLE "game_tag" DROP CONSTRAINT "games_tags_game_id_tag_id_pk";--> statement-breakpoint

-- 6. Add new unique constraints (must happen before FKs that reference them)
ALTER TABLE "crossplay_information" ADD CONSTRAINT "crossplay_information_game_id_key" UNIQUE("game_id");--> statement-breakpoint
ALTER TABLE "game_category" ADD CONSTRAINT "game_category_pointer_key" UNIQUE("pointer");--> statement-breakpoint
ALTER TABLE "game_category" ADD CONSTRAINT "game_category_slug_key" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "game_mode" ADD CONSTRAINT "game_mode_slug_key" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "game_slug_key" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "platform" ADD CONSTRAINT "platform_slug_key" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "store" ADD CONSTRAINT "store_slug_key" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "tag" ADD CONSTRAINT "tag_slug_key" UNIQUE("slug");--> statement-breakpoint

-- 7. Add new composite primary keys
ALTER TABLE "game_submission_game_mode" ADD CONSTRAINT "game_submission_game_mode_pkey" PRIMARY KEY("submission_id","game_mode_id");--> statement-breakpoint
ALTER TABLE "platform_group_platform" ADD CONSTRAINT "platform_group_platform_pkey" PRIMARY KEY("platform_group_id","platform_id");--> statement-breakpoint
ALTER TABLE "store_crossplay_platform" ADD CONSTRAINT "store_crossplay_platform_pkey" PRIMARY KEY("store_platform_id","platform_id");--> statement-breakpoint
ALTER TABLE "store_supported_platform" ADD CONSTRAINT "store_supported_platform_pkey" PRIMARY KEY("store_id","platform_id");--> statement-breakpoint
ALTER TABLE "game_tag" ADD CONSTRAINT "game_tag_pkey" PRIMARY KEY("game_id","tag_id");--> statement-breakpoint

-- 8. Add new foreign keys
ALTER TABLE "crossplay_information" ADD CONSTRAINT "crossplay_information_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_submission_game_mode" ADD CONSTRAINT "game_submission_game_mode_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_submission_game_mode" ADD CONSTRAINT "game_submission_game_mode_game_mode_id_fkey" FOREIGN KEY ("game_mode_id") REFERENCES "public"."game_mode"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game" ADD CONSTRAINT "game_category_fkey" FOREIGN KEY ("category") REFERENCES "public"."game_category"("pointer") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_group_platform" ADD CONSTRAINT "platform_group_platform_platform_group_id_fkey" FOREIGN KEY ("platform_group_id") REFERENCES "public"."platform_group"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_group_platform" ADD CONSTRAINT "platform_group_platform_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platform"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "platform_group" ADD CONSTRAINT "platform_group_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_crossplay_platform" ADD CONSTRAINT "store_crossplay_platform_store_platform_id_fkey" FOREIGN KEY ("store_platform_id") REFERENCES "public"."store_platform"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_crossplay_platform" ADD CONSTRAINT "store_crossplay_platform_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platform"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_platform" ADD CONSTRAINT "store_platform_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_supported_platform" ADD CONSTRAINT "store_supported_platform_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "store_supported_platform" ADD CONSTRAINT "store_supported_platform_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platform"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "game_tag" ADD CONSTRAINT "game_tag_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "game_tag" ADD CONSTRAINT "game_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint

-- 9. Create new indexes
CREATE INDEX "game_mode_name_idx" ON "game_mode" USING btree ("name");--> statement-breakpoint
CREATE INDEX "game_submission_game_mode_game_mode_id_idx" ON "game_submission_game_mode" USING btree ("game_mode_id");--> statement-breakpoint
CREATE INDEX "game_category_idx" ON "game" USING btree ("category");--> statement-breakpoint
CREATE INDEX "game_name_idx" ON "game" USING btree ("name");--> statement-breakpoint
CREATE INDEX "game_status_idx" ON "game" USING btree ("status");--> statement-breakpoint
CREATE INDEX "game_first_release_date_idx" ON "game" USING btree ("first_release_date");--> statement-breakpoint
CREATE INDEX "game_created_at_idx" ON "game" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "game_updated_at_idx" ON "game" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "platform_group_platform_platform_id_idx" ON "platform_group_platform" USING btree ("platform_id");--> statement-breakpoint
CREATE INDEX "platform_group_submission_id_idx" ON "platform_group" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "platform_name_idx" ON "platform" USING btree ("name");--> statement-breakpoint
CREATE INDEX "platform_abbreviation_idx" ON "platform" USING btree ("abbreviation");--> statement-breakpoint
CREATE INDEX "store_crossplay_platform_platform_id_idx" ON "store_crossplay_platform" USING btree ("platform_id");--> statement-breakpoint
CREATE INDEX "store_platform_submission_id_idx" ON "store_platform" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "store_platform_store_slug_idx" ON "store_platform" USING btree ("store_slug");--> statement-breakpoint
CREATE INDEX "store_supported_platform_platform_id_idx" ON "store_supported_platform" USING btree ("platform_id");--> statement-breakpoint
CREATE INDEX "store_name_idx" ON "store" USING btree ("name");--> statement-breakpoint
CREATE INDEX "game_tag_tag_id_idx" ON "game_tag" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "tag_name_idx" ON "tag" USING btree ("name");--> statement-breakpoint

-- 10. Rename single-column primary keys
ALTER TABLE "game_category" RENAME CONSTRAINT "game_categories_pkey" TO "game_category_pkey";--> statement-breakpoint
ALTER TABLE "game" RENAME CONSTRAINT "game_submissions_pkey" TO "game_pkey";--> statement-breakpoint
ALTER TABLE "platform" RENAME CONSTRAINT "platforms_pkey" TO "platform_pkey";--> statement-breakpoint
ALTER TABLE "store" RENAME CONSTRAINT "pc_stores_pkey" TO "store_pkey";--> statement-breakpoint
ALTER TABLE "tag" RENAME CONSTRAINT "tags_pkey" TO "tag_pkey";--> statement-breakpoint
ALTER TABLE "game_mode" RENAME CONSTRAINT "game_modes_pkey" TO "game_mode_pkey";--> statement-breakpoint
ALTER TABLE "platform_group" RENAME CONSTRAINT "platform_groups_pkey" TO "platform_group_pkey";--> statement-breakpoint
ALTER TABLE "store_platform" RENAME CONSTRAINT "pc_store_platforms_pkey" TO "store_platform_pkey";