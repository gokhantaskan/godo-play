ALTER TABLE "game_submission_game_modes" DROP CONSTRAINT "game_submission_game_modes_game_mode_id_game_modes_id_fk";
--> statement-breakpoint
ALTER TABLE "game_submission_game_modes" ADD CONSTRAINT "game_submission_game_modes_game_mode_id_game_modes_id_fk" FOREIGN KEY ("game_mode_id") REFERENCES "public"."game_modes"("id") ON DELETE cascade ON UPDATE cascade;