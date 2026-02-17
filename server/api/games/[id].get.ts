import { eq } from "drizzle-orm";

import { db } from "~~/server/db";
import { games } from "~~/server/db/schema";

export default defineEventHandler(async event => {
  const id = event.context.params?.id;

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Missing game ID",
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
          store: true,
          crossplayEntries: {
            with: {
              platform: true,
            },
          },
        },
      },
      gameGameModes: {
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
      message: "Game not found",
    });
  }

  return game;
});
