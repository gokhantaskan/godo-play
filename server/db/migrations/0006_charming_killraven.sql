CREATE TABLE "crossplay_information" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"evidence_url" text,
	"information" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "crossplay_information_game_id_unique" UNIQUE("game_id")
);
--> statement-breakpoint
ALTER TABLE "crossplay_information" ADD CONSTRAINT "crossplay_information_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;