CREATE TABLE IF NOT EXISTS "game_modes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "game_modes_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "game_submission_game_modes" (
	"submission_id" integer NOT NULL,
	"game_mode_id" integer NOT NULL,
	CONSTRAINT "game_submission_game_modes_submission_id_game_mode_id_pk" PRIMARY KEY("submission_id","game_mode_id")
);

DO $$ BEGIN
 ALTER TABLE "game_submission_game_modes" ADD CONSTRAINT "game_submission_game_modes_submission_id_game_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "game_submissions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "game_submission_game_modes" ADD CONSTRAINT "game_submission_game_modes_game_mode_id_game_modes_id_fk" FOREIGN KEY ("game_mode_id") REFERENCES "game_modes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;