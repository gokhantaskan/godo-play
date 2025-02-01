DROP SEQUENCE IF EXISTS "public"."game_mode_id_seq";
--> statement-breakpoint
CREATE SEQUENCE "public"."game_mode_id_seq" INCREMENT BY 1 MINVALUE 100 MAXVALUE 9223372036854775807 START WITH 100 CACHE 1;
--> statement-breakpoint
ALTER TABLE "game_submission_game_modes" DROP CONSTRAINT "game_submission_game_modes_game_mode_id_game_modes_id_fk";
--> statement-breakpoint
ALTER TABLE "game_modes" ALTER COLUMN "id" SET DATA TYPE integer;
--> statement-breakpoint
ALTER TABLE "game_modes" ALTER COLUMN "id" SET DEFAULT nextval('game_mode_id_seq');
--> statement-breakpoint
ALTER TABLE "game_submission_game_modes" ADD CONSTRAINT "game_submission_game_modes_game_mode_id_game_modes_id_fk" FOREIGN KEY ("game_mode_id") REFERENCES "public"."game_modes"("id") ON DELETE cascade ON UPDATE no action;