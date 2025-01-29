CREATE TABLE "store_supported_platforms" (
	"store_id" integer NOT NULL,
	"platform_id" integer NOT NULL,
	CONSTRAINT "store_supported_platforms_store_id_platform_id_pk" PRIMARY KEY("store_id","platform_id")
);
--> statement-breakpoint
ALTER TABLE "pc_store_crossplay_platforms" RENAME TO "store_crossplay_platforms";--> statement-breakpoint
ALTER TABLE "pc_store_platforms" RENAME TO "store_platforms";--> statement-breakpoint
ALTER TABLE "pc_stores" RENAME TO "stores";--> statement-breakpoint
ALTER TABLE "store_crossplay_platforms" RENAME COLUMN "pc_store_platform_id" TO "store_platform_id";--> statement-breakpoint
ALTER TABLE "stores" DROP CONSTRAINT "pc_stores_slug_unique";--> statement-breakpoint
ALTER TABLE "store_crossplay_platforms" DROP CONSTRAINT "pc_store_crossplay_platforms_pc_store_platform_id_pc_store_platforms_id_fk";
--> statement-breakpoint
ALTER TABLE "store_crossplay_platforms" DROP CONSTRAINT "pc_store_crossplay_platforms_platform_id_platforms_id_fk";
--> statement-breakpoint
ALTER TABLE "store_platforms" DROP CONSTRAINT "pc_store_platforms_submission_id_games_id_fk";
--> statement-breakpoint
ALTER TABLE "store_crossplay_platforms" DROP CONSTRAINT "pc_store_crossplay_platforms_pc_store_platform_id_platform_id_pk";--> statement-breakpoint
ALTER TABLE "store_crossplay_platforms" ADD CONSTRAINT "store_crossplay_platforms_store_platform_id_platform_id_pk" PRIMARY KEY("store_platform_id","platform_id");--> statement-breakpoint
ALTER TABLE "store_supported_platforms" ADD CONSTRAINT "store_supported_platforms_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_supported_platforms" ADD CONSTRAINT "store_supported_platforms_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_crossplay_platforms" ADD CONSTRAINT "store_crossplay_platforms_store_platform_id_store_platforms_id_fk" FOREIGN KEY ("store_platform_id") REFERENCES "public"."store_platforms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_crossplay_platforms" ADD CONSTRAINT "store_crossplay_platforms_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_platforms" ADD CONSTRAINT "store_platforms_submission_id_games_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_slug_unique" UNIQUE("slug");