ALTER TABLE "games" DROP CONSTRAINT IF EXISTS "games_external_id_unique";--> statement-breakpoint
ALTER TABLE "games" DROP CONSTRAINT IF EXISTS "games_image_id_unique";--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN IF NOT EXISTS "external" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
UPDATE "games" SET "external" = jsonb_build_object(
  'igdbId', CAST("external_id" AS integer),
  'igdbImageId', NULLIF("image_id", '')::text
);--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN IF EXISTS "external_id";--> statement-breakpoint
ALTER TABLE "games" DROP COLUMN IF EXISTS "image_id";