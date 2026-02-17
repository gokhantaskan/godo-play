ALTER TABLE "game_submission_game_mode" RENAME TO "game_game_mode";--> statement-breakpoint
ALTER TABLE "game_game_mode" RENAME COLUMN "submission_id" TO "game_id";--> statement-breakpoint
ALTER TABLE "platform_group" RENAME COLUMN "submission_id" TO "game_id";--> statement-breakpoint
ALTER TABLE "store_platform" RENAME COLUMN "submission_id" TO "game_id";--> statement-breakpoint
ALTER TABLE "game_game_mode" DROP CONSTRAINT "game_submission_game_mode_submission_id_fkey";
--> statement-breakpoint
ALTER TABLE "game_game_mode" DROP CONSTRAINT "game_submission_game_mode_game_mode_id_fkey";
--> statement-breakpoint
ALTER TABLE "platform_group" DROP CONSTRAINT "platform_group_submission_id_fkey";
--> statement-breakpoint
ALTER TABLE "store_platform" DROP CONSTRAINT "store_platform_submission_id_fkey";
--> statement-breakpoint
DROP INDEX "game_submission_game_mode_game_mode_id_idx";--> statement-breakpoint
DROP INDEX "platform_group_submission_id_idx";--> statement-breakpoint
DROP INDEX "store_platform_submission_id_idx";--> statement-breakpoint
DROP INDEX "store_platform_store_slug_idx";--> statement-breakpoint
ALTER TABLE "game_game_mode" DROP CONSTRAINT "game_submission_game_mode_pkey";--> statement-breakpoint
ALTER TABLE "game_game_mode" ADD CONSTRAINT "game_game_mode_pkey" PRIMARY KEY("game_id","game_mode_id");--> statement-breakpoint
ALTER TABLE "store_platform" ADD COLUMN "store_id" integer;--> statement-breakpoint
UPDATE "store_platform" sp SET "store_id" = s."id" FROM "store" s WHERE s."slug" = sp."store_slug";--> statement-breakpoint
ALTER TABLE "store_platform" ALTER COLUMN "store_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "game_game_mode" ADD CONSTRAINT "game_game_mode_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_game_mode" ADD CONSTRAINT "game_game_mode_game_mode_id_fkey" FOREIGN KEY ("game_mode_id") REFERENCES "public"."game_mode"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_group" ADD CONSTRAINT "platform_group_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_platform" ADD CONSTRAINT "store_platform_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_platform" ADD CONSTRAINT "store_platform_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "game_game_mode_game_mode_id_idx" ON "game_game_mode" USING btree ("game_mode_id");--> statement-breakpoint
CREATE INDEX "platform_group_game_id_idx" ON "platform_group" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "store_platform_game_id_idx" ON "store_platform" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "store_platform_store_id_idx" ON "store_platform" USING btree ("store_id");--> statement-breakpoint
ALTER TABLE "store_platform" DROP COLUMN "store_slug";