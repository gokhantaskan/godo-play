import { pgEnum } from "drizzle-orm/pg-core";

export const userRoles = pgEnum("roles", ["admin", "user"]);
