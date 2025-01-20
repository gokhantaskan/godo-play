CREATE TABLE "game_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"game_name" text NOT NULL,
	"game_slug" text NOT NULL,
	"game_image_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_store_crossplay_platforms" (
	"pc_store_platform_id" integer NOT NULL,
	"platform_id" integer NOT NULL,
	CONSTRAINT "pc_store_crossplay_platforms_pc_store_platform_id_platform_id_pk" PRIMARY KEY("pc_store_platform_id","platform_id")
);
--> statement-breakpoint
CREATE TABLE "pc_store_platform_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"group_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_store_platforms" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"store_slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pc_stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pc_stores_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "platform_group_platforms" (
	"platform_group_id" integer NOT NULL,
	"platform_id" integer NOT NULL,
	CONSTRAINT "platform_group_platforms_platform_group_id_platform_id_pk" PRIMARY KEY("platform_group_id","platform_id")
);
--> statement-breakpoint
CREATE TABLE "platform_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"group_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platforms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "platforms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "pc_store_crossplay_platforms" ADD CONSTRAINT "pc_store_crossplay_platforms_pc_store_platform_id_pc_store_platforms_id_fk" FOREIGN KEY ("pc_store_platform_id") REFERENCES "public"."pc_store_platforms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_store_crossplay_platforms" ADD CONSTRAINT "pc_store_crossplay_platforms_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_store_platform_groups" ADD CONSTRAINT "pc_store_platform_groups_submission_id_game_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."game_submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pc_store_platforms" ADD CONSTRAINT "pc_store_platforms_submission_id_game_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."game_submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_group_platforms" ADD CONSTRAINT "platform_group_platforms_platform_group_id_platform_groups_id_fk" FOREIGN KEY ("platform_group_id") REFERENCES "public"."platform_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_group_platforms" ADD CONSTRAINT "platform_group_platforms_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_groups" ADD CONSTRAINT "platform_groups_submission_id_game_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."game_submissions"("id") ON DELETE no action ON UPDATE no action;