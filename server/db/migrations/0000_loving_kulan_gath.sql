CREATE TABLE IF NOT EXISTS "game_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" integer NOT NULL,
	"game_name" text NOT NULL,
	"game_slug" text NOT NULL,
	"game_image_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "game_submissions_game_id_unique" UNIQUE("game_id"),
	CONSTRAINT "game_submissions_game_slug_unique" UNIQUE("game_slug"),
	CONSTRAINT "game_submissions_game_image_id_unique" UNIQUE("game_image_id")
);

CREATE TABLE IF NOT EXISTS "pc_store_crossplay_platforms" (
	"pc_store_platform_id" integer NOT NULL,
	"platform_id" integer NOT NULL,
	CONSTRAINT "pc_store_crossplay_platforms_pc_store_platform_id_platform_id_pk" PRIMARY KEY("pc_store_platform_id","platform_id")
);

CREATE TABLE IF NOT EXISTS "pc_store_platform_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "pc_store_platforms" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"store_slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "pc_stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pc_stores_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "platform_group_platforms" (
	"platform_group_id" integer NOT NULL,
	"platform_id" integer NOT NULL,
	CONSTRAINT "platform_group_platforms_platform_group_id_platform_id_pk" PRIMARY KEY("platform_group_id","platform_id")
);

CREATE TABLE IF NOT EXISTS "platform_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "platforms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"abbreviation" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "platforms_slug_unique" UNIQUE("slug")
);

DO $$ BEGIN
 ALTER TABLE "pc_store_crossplay_platforms" ADD CONSTRAINT "pc_store_crossplay_platforms_pc_store_platform_id_pc_store_platforms_id_fk" FOREIGN KEY ("pc_store_platform_id") REFERENCES "pc_store_platforms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "pc_store_crossplay_platforms" ADD CONSTRAINT "pc_store_crossplay_platforms_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "pc_store_platform_groups" ADD CONSTRAINT "pc_store_platform_groups_submission_id_game_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "game_submissions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "pc_store_platforms" ADD CONSTRAINT "pc_store_platforms_submission_id_game_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "game_submissions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "platform_group_platforms" ADD CONSTRAINT "platform_group_platforms_platform_group_id_platform_groups_id_fk" FOREIGN KEY ("platform_group_id") REFERENCES "platform_groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "platform_group_platforms" ADD CONSTRAINT "platform_group_platforms_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "platform_groups" ADD CONSTRAINT "platform_groups_submission_id_game_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "game_submissions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;