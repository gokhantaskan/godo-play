import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { defineConfig } from "drizzle-kit";

// Only load .env if POSTGRES_URL is not already set (e.g., by env-cmd)
if (!process.env.POSTGRES_URL) {
  expand(config());
}

export default defineConfig({
  out: "./server/db/migrations",
  schema: "./server/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
