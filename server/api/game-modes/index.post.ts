import { db } from "~~/server/db";
import { BaseInsertGameModeSchema, gameModes } from "~~/server/db/schema";

const schema = BaseInsertGameModeSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export default defineEventHandler(async event => {
  try {
    const body = await readValidatedBody(event, schema.parse);

    const [gameMode] = await db.insert(gameModes).values(body).returning();

    return gameMode;
  } catch (error) {
    throwApiError(error);
  }
});
