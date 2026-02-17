import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

export const db = drizzle({
  connection: {
    connectionString: process.env.POSTGRES_URL!,
    ssl:
      process.env.POSTGRES_SSL === "true"
        ? { rejectUnauthorized: false }
        : false,
  },
  schema,
  casing: "snake_case",
});
