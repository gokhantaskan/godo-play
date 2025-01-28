ALTER TABLE "game_submission_game_modes" DROP CONSTRAINT "game_submission_game_modes_submission_id_games_id_fk";
--> statement-breakpoint
ALTER TABLE "game_submission_game_modes" ADD CONSTRAINT "game_submission_game_modes_submission_id_games_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;