DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'games_release_date_idx') THEN
        CREATE INDEX "games_release_date_idx" ON "games" USING btree ("first_release_date");
    END IF;
END $$;--> statement-breakpoint

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'games_created_at_idx') THEN
        CREATE INDEX "games_created_at_idx" ON "games" USING btree ("created_at");
    END IF;
END $$;--> statement-breakpoint

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'games_updated_at_idx') THEN
        CREATE INDEX "games_updated_at_idx" ON "games" USING btree ("updated_at");
    END IF;
END $$;