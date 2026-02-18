import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { defineConfig } from "drizzle-kit";

// Always expand so ${VAR} references in POSTGRES_URL get resolved,
// even if drizzle-kit pre-loads .env without expansion.
expand(config({ override: true }));

export default defineConfig({
  out: "./server/db/migrations",
  schema: "./server/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
    ssl:
      process.env.POSTGRES_HOST === "localhost"
        ? false
        : { rejectUnauthorized: false },
  },
});
