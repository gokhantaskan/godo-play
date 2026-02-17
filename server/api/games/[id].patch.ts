import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "~~/server/db";
import {
  crossplayInformation,
  gameGameModes,
  games,
  gamesTags,
  platformGroupPlatforms,
  platformGroups,
  storeCrossplayPlatforms,
  storePlatforms,
  stores,
} from "~~/server/db/schema";
import { isH3ErrorLike } from "~~/server/utils/errorHandler";
import {
  InsertPlatformGroupPlatformsSchema,
  InsertPlatformGroupSchema,
} from "~~/shared/schemas/platformGroup";
import {
  InsertStoreCrossplayPlatformSchema,
  InsertStorePlatformSchema,
} from "~~/shared/schemas/storePlatform";

// Validate the request body
const updateGameSchema = z.object({
  category: z.number().optional(),
  freeToPlay: z.boolean().optional(),
  platformGroups: z
    .array(z.array(z.number()))
    .min(1, "At least one platform group is required")
    .optional(),
  storesPlatforms: z
    .record(
      z.string(),
      z.object({
        crossplayPlatforms: z.array(z.number()).default([]),
        storeUrl: z.string().url().optional(),
      })
    )
    .optional(),
  gameModeIds: z
    .array(z.number())
    .min(1, "At least one game mode is required")
    .optional(),
  tagIds: z.array(z.number()).optional(),
  status: z.enum(["approved", "rejected"]).optional(),
  crossplayInformation: z
    .object({
      evidenceUrl: z.string().url().nullable(),
      information: z.string().nullable(),
      isOfficial: z.boolean().optional(),
    })
    .nullable()
    .optional(),
});

type RequestBody = z.infer<typeof updateGameSchema>;

export default defineEventHandler(async event => {
  const gameId = parseInt(event.context.params?.id as string);

  if (isNaN(gameId)) {
    throw createError({
      statusCode: 400,
      message: "Invalid game ID",
    });
  }

  try {
    // Validate request body
    const body = await readBody<RequestBody>(event);
    updateGameSchema.parse(body);

    const result = await db.transaction(async tx => {
      // Check if game exists
      const game = await tx.query.games.findFirst({
        where: eq(games.id, gameId),
      });

      if (!game) {
        throw createError({
          statusCode: 404,
          message: "Game not found",
        });
      }

      // Delete and process platform groups only if provided
      if (body.platformGroups) {
        await tx
          .delete(platformGroups)
          .where(eq(platformGroups.gameId, gameId));

        // Process all insertions sequentially to maintain atomicity
        for (const groupPlatforms of body.platformGroups) {
          const [group] = await tx
            .insert(platformGroups)
            .values(
              InsertPlatformGroupSchema.parse({
                gameId,
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
      }

      // Process PC store platforms only if provided
      if (body.storesPlatforms) {
        await tx
          .delete(storePlatforms)
          .where(eq(storePlatforms.gameId, gameId));

        // Preload store slug→id map
        const allStores = await tx
          .select({ id: stores.id, slug: stores.slug })
          .from(stores);
        const storeSlugToId = new Map(allStores.map(s => [s.slug, s.id]));

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
                gameId,
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
      }

      // Process game modes only if provided
      if (body.gameModeIds) {
        await tx.delete(gameGameModes).where(eq(gameGameModes.gameId, gameId));

        if (body.gameModeIds.length > 0) {
          await tx.insert(gameGameModes).values(
            body.gameModeIds.map(gameModeId => ({
              gameId,
              gameModeId,
            }))
          );
        }
      }

      // Process tags if provided
      if (body.tagIds !== undefined) {
        await tx.delete(gamesTags).where(eq(gamesTags.gameId, gameId));

        if (body.tagIds.length > 0) {
          await tx.insert(gamesTags).values(
            body.tagIds.map(tagId => ({
              gameId: gameId,
              tagId,
            }))
          );
        }
      }

      // Update category and crossplay information if provided
      if (
        body.category !== undefined ||
        body.crossplayInformation ||
        body.status ||
        body.freeToPlay !== undefined
      ) {
        const updateData: Record<string, unknown> = {};

        if (body.category !== undefined) {
          updateData.category = body.category;
        }

        if (body.status) {
          updateData.status = body.status;
        }

        if (body.freeToPlay !== undefined) {
          updateData.freeToPlay = body.freeToPlay;
        }

        const [updatedGame] = await tx
          .update(games)
          .set(updateData)
          .where(eq(games.id, gameId))
          .returning();

        if (!updatedGame) {
          throw createError({
            statusCode: 500,
            message: "Failed to update game",
          });
        }

        // Handle crossplay information
        if (body.crossplayInformation !== undefined) {
          const existingCrossplay =
            await tx.query.crossplayInformation.findFirst({
              where: eq(crossplayInformation.gameId, gameId),
            });

          if (body.crossplayInformation === null) {
            if (existingCrossplay) {
              await tx
                .delete(crossplayInformation)
                .where(eq(crossplayInformation.gameId, gameId));
            }
          } else {
            if (existingCrossplay) {
              await tx
                .update(crossplayInformation)
                .set({
                  evidenceUrl: body.crossplayInformation.evidenceUrl,
                  information: body.crossplayInformation.information,
                  isOfficial: body.crossplayInformation.isOfficial ?? false,
                })
                .where(eq(crossplayInformation.gameId, gameId));
            } else {
              await tx.insert(crossplayInformation).values({
                gameId: gameId,
                evidenceUrl: body.crossplayInformation.evidenceUrl,
                information: body.crossplayInformation.information,
                isOfficial: body.crossplayInformation.isOfficial ?? false,
              });
            }
          }
        }
      }

      return game;
    });

    return result;
  } catch (error) {
    console.error("game patch error", error);

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
      message: "Failed to update game",
      data: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});
