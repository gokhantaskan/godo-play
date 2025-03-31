import { eq } from "drizzle-orm";

import { db } from "~~/server/db";
import { games } from "~~/server/db/schema";

export default defineEventHandler(async event => {
  const id = event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Missing submission ID",
    });
  }

  const game = await db.query.games.findFirst({
    where: eq(games.id, parseInt(id)),
    with: {
      crossplayInformation: true,
      platformGroups: {
        with: {
          platformGroupPlatforms: {
            with: {
              platform: true,
            },
          },
        },
      },
      storePlatforms: {
        with: {
          crossplayEntries: {
            with: {
              platform: true,
            },
          },
        },
      },
      gameSubmissionGameModes: {
        with: {
          gameMode: true,
        },
      },
      tags: {
        with: {
          tag: true,
        },
      },
    },
  });

  if (!game) {
    throw createError({
      statusCode: 404,
      message: "Submission not found",
    });
  }

  return game;
});
