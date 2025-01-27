CREATE TABLE IF NOT EXISTS "game_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"pointer" integer NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "game_categories_pointer_unique" UNIQUE("pointer"),
	CONSTRAINT "game_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "games" ADD COLUMN "category" integer;
EXCEPTION
 WHEN duplicate_column THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "games" ADD CONSTRAINT "games_category_game_categories_pointer_fk" 
   FOREIGN KEY ("category") REFERENCES "public"."game_categories"("pointer") 
   ON DELETE NO ACTION ON UPDATE NO ACTION;
EXCEPTION
 WHEN duplicate_object THEN NULL;
END $$;