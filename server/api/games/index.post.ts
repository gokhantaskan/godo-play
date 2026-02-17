import { inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "~~/server/db";
import {
  crossplayInformation,
  gameGameModes,
  games,
  gamesTags,
  platformGroupPlatforms,
  platformGroups,
  platforms,
  storeCrossplayPlatforms,
  storePlatforms,
  stores,
} from "~~/server/db/schema";
import { isH3ErrorLike } from "~~/server/utils/errorHandler";
import { verifyRecaptchaToken } from "~~/server/utils/recaptcha";
import { type SubmitGame, SubmitGameSchema } from "~~/shared/schemas/game";
import { PlatformSchema } from "~~/shared/schemas/platform";
import {
  InsertPlatformGroupPlatformsSchema,
  InsertPlatformGroupSchema,
} from "~~/shared/schemas/platformGroup";
import {
  InsertStoreCrossplayPlatformSchema,
  InsertStorePlatformSchema,
} from "~~/shared/schemas/storePlatform";

export default defineEventHandler(async event => {
  try {
    // Validate request body
    const body = await readBody<SubmitGame>(event);
    SubmitGameSchema.parse(body);

    // Verify reCAPTCHA token
    const { success: isValidToken } = await verifyRecaptchaToken(body.token);
    if (!isValidToken) {
      throw createError({
        statusCode: 400,
        message: "Invalid reCAPTCHA token",
      });
    }

    const result = await db.transaction(async tx => {
      // Insert game
      const [game] = await tx
        .insert(games)
        .values({
          external: body.game.external,
          name: body.game.name,
          slug: body.game.slug,
          category: body.game.category,
          firstReleaseDate: body.game.firstReleaseDate,
          freeToPlay: body.game.freeToPlay,
        })
        .returning();

      if (!game) {
        throw createError({
          statusCode: 500,
          message: "Failed to create game",
        });
      }

      // Insert crossplay information if provided
      if (body.crossplayInformation) {
        await tx.insert(crossplayInformation).values({
          gameId: game.id,
          evidenceUrl: body.crossplayInformation.evidenceUrl,
          information: body.crossplayInformation.information,
          isOfficial: body.crossplayInformation.isOfficial ?? false,
        });
      }

      // Collect and validate platform IDs
      const platformIdsSet = new Set<number>();
      body.platformGroups.forEach(group => {
        group.forEach(platformId => platformIdsSet.add(platformId));
      });
      Object.values(body.storesPlatforms).forEach(storeData => {
        storeData.crossplayPlatforms.forEach(platformId =>
          platformIdsSet.add(platformId)
        );
      });

      const platformIds = Array.from(platformIdsSet);
      const existingPlatforms = await tx
        .select()
        .from(platforms)
        .where(inArray(platforms.id, platformIds));

      const validatedPlatforms = existingPlatforms.map(platform =>
        PlatformSchema.parse(platform)
      );

      const existingPlatformIds = validatedPlatforms.map(p => p.id);
      const missingPlatformIds = platformIds.filter(
        id => !existingPlatformIds.includes(id)
      );

      if (missingPlatformIds.length > 0) {
        throw createError({
          statusCode: 400,
          message: "Some platform IDs do not exist",
          data: { missingPlatformIds },
        });
      }

      // Process platform groups sequentially instead of Promise.all
      for (const groupPlatforms of body.platformGroups) {
        const [group] = await tx
          .insert(platformGroups)
          .values(
            InsertPlatformGroupSchema.parse({
              gameId: game.id,
            })
          )
          .returning();

        if (!group) {
          throw createError({
            statusCode: 500,
            message: "Failed to create platform group",
          });
        }

        if (groupPlatforms.length > 0) {
          await tx.insert(platformGroupPlatforms).values(
            groupPlatforms.map(platformId =>
              InsertPlatformGroupPlatformsSchema.parse({
                platformGroupId: group.id,
                platformId,
              })
            )
          );
        }
      }

      // Preload store slug→id map
      const allStores = await tx
        .select({ id: stores.id, slug: stores.slug })
        .from(stores);
      const storeSlugToId = new Map(allStores.map(s => [s.slug, s.id]));

      // Process PC store platforms sequentially
      for (const [slug, { crossplayPlatforms, storeUrl }] of Object.entries(
        body.storesPlatforms
      )) {
        const storeId = storeSlugToId.get(slug);
        if (!storeId) {
          throw createError({
            statusCode: 400,
            message: `Unknown store: ${slug}`,
          });
        }

        const [storePlatform] = await tx
          .insert(storePlatforms)
          .values(
            InsertStorePlatformSchema.parse({
              gameId: game.id,
              storeId,
              storeUrl,
            })
          )
          .returning();

        if (!storePlatform) {
          throw createError({
            statusCode: 500,
            message: "Failed to create PC store platform",
          });
        }

        if (crossplayPlatforms.length > 0) {
          await tx.insert(storeCrossplayPlatforms).values(
            crossplayPlatforms.map(platformId =>
              InsertStoreCrossplayPlatformSchema.parse({
                storePlatformId: storePlatform.id,
                platformId,
              })
            )
          );
        }
      }

      // Process game modes
      if (body.gameModeIds && body.gameModeIds.length > 0) {
        await tx.insert(gameGameModes).values(
          body.gameModeIds.map(gameModeId => ({
            gameId: game.id,
            gameModeId,
          }))
        );
      }

      // Insert tags if provided
      if (body.tagIds && body.tagIds.length > 0) {
        await tx.insert(gamesTags).values(
          body.tagIds.map(tagId => ({
            gameId: game.id,
            tagId,
          }))
        );
      }

      return game;
    });

    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: "Invalid request data",
        data: {
          errors: error.issues.reduce(
            (acc: Record<string, string>, err) => {
              acc[err.path.join(".")] = err.message;
              return acc;
            },
            {} as Record<string, string>
          ),
        },
      });
    }

    if (isH3ErrorLike(error)) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: "Failed to process game",
      data: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});
