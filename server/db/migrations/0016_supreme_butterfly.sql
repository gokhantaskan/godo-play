CREATE TABLE "games_tags" (
	"game_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "games_tags_game_id_tag_id_pk" PRIMARY KEY("game_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "games_tags" ADD CONSTRAINT "games_tags_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "games_tags" ADD CONSTRAINT "games_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE cascade;