CREATE TABLE IF NOT EXISTS "game_modes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "game_modes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "game_submission_game_modes" (
	"submission_id" integer NOT NULL,
	"game_mode_id" integer NOT NULL,
	CONSTRAINT "game_submission_game_modes_submission_id_game_mode_id_pk" PRIMARY KEY("submission_id","game_mode_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"external_id" integer NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"image_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "games_external_id_unique" UNIQUE("external_id"),
	CONSTRAINT "games_slug_unique" UNIQUE("slug"),
	CONSTRAINT "games_image_id_unique" UNIQUE("image_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pc_store_crossplay_platforms" (
	"pc_store_platform_id" integer NOT NULL,
	"platform_id" integer NOT NULL,
	CONSTRAINT "pc_store_crossplay_platforms_pc_store_platform_id_platform_id_pk" PRIMARY KEY("pc_store_platform_id","platform_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pc_store_platforms" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"store_slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pc_stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pc_stores_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platform_group_platforms" (
	"platform_group_id" integer NOT NULL,
	"platform_id" integer NOT NULL,
	CONSTRAINT "platform_group_platforms_platform_group_id_platform_id_pk" PRIMARY KEY("platform_group_id","platform_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platform_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "platforms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"abbreviation" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "platforms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game_submission_game_modes" ADD CONSTRAINT "game_submission_game_modes_submission_id_games_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game_submission_game_modes" ADD CONSTRAINT "game_submission_game_modes_game_mode_id_game_modes_id_fk" FOREIGN KEY ("game_mode_id") REFERENCES "public"."game_modes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pc_store_crossplay_platforms" ADD CONSTRAINT "pc_store_crossplay_platforms_pc_store_platform_id_pc_store_platforms_id_fk" FOREIGN KEY ("pc_store_platform_id") REFERENCES "public"."pc_store_platforms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pc_store_crossplay_platforms" ADD CONSTRAINT "pc_store_crossplay_platforms_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pc_store_platforms" ADD CONSTRAINT "pc_store_platforms_submission_id_games_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "platform_group_platforms" ADD CONSTRAINT "platform_group_platforms_platform_group_id_platform_groups_id_fk" FOREIGN KEY ("platform_group_id") REFERENCES "public"."platform_groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "platform_group_platforms" ADD CONSTRAINT "platform_group_platforms_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "platform_groups" ADD CONSTRAINT "platform_groups_submission_id_games_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;