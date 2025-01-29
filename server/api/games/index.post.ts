import { inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "~~/server/db";
import {
  games,
  gameSubmissionGameModes,
  platformGroupPlatforms,
  platformGroups,
  platforms,
  storeCrossplayPlatforms,
  storePlatforms,
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
  let body: SubmitGame;
  try {
    body = await readBody<SubmitGame>(event);
    SubmitGameSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: "Invalid request data",
        data: {
          errors: error.errors.reduce(
            (acc, err) => {
              acc[err.path.join(".")] = err.message;
              return acc;
            },
            {} as Record<string, string>
          ),
        },
      });
    }
    throw createError({
      statusCode: 400,
      message: "Invalid request data",
    });
  }

  try {
    const { success: isValidToken } = await verifyRecaptchaToken(body.token);
    if (!isValidToken) {
      throw createError({
        statusCode: 400,
        message: "Invalid reCAPTCHA token",
      });
    }
  } catch (error: unknown) {
    if (isH3ErrorLike(error)) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: "Failed to verify reCAPTCHA token",
    });
  }

  try {
    const result = await db.transaction(async tx => {
      // Insert game submission
      const [submission] = await tx
        .insert(games)
        .values({
          external: body.game.external,
          name: body.game.name,
          slug: body.game.slug,
          category: body.game.category,
        })
        .returning();

      if (!submission) {
        throw createError({
          statusCode: 500,
          message: "Failed to create game submission",
        });
      }

      // Collect all platform IDs used in the submission
      const platformIdsSet = new Set<number>();

      // From platform groups
      body.platformGroups.forEach(group => {
        group.forEach(platformId => platformIdsSet.add(platformId));
      });

      // From PC store crossplay platforms
      Object.values(body.storesPlatforms).forEach(storeData => {
        storeData.crossplayPlatforms.forEach(platformId =>
          platformIdsSet.add(platformId)
        );
      });

      const platformIds = Array.from(platformIdsSet);

      // Ensure platforms exist in the `platforms` table
      const existingPlatforms = await tx
        .select()
        .from(platforms)
        .where(inArray(platforms.id, platformIds));

      // Validate platforms using PlatformSchema
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
              submissionId: submission.id,
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

      // Process PC store platforms sequentially
      for (const [storeSlug, { crossplayPlatforms }] of Object.entries(
        body.storesPlatforms
      )) {
        const [pcStore] = await tx
          .insert(storePlatforms)
          .values(
            InsertStorePlatformSchema.parse({
              submissionId: submission.id,
              storeSlug,
            })
          )
          .returning();

        if (!pcStore) {
          throw createError({
            statusCode: 500,
            message: "Failed to create PC store platform",
          });
        }

        if (crossplayPlatforms.length > 0) {
          await tx.insert(storeCrossplayPlatforms).values(
            crossplayPlatforms.map(platformId =>
              InsertStoreCrossplayPlatformSchema.parse({
                storePlatformId: pcStore.id,
                platformId,
              })
            )
          );
        }
      }

      // Process game modes
      if (body.gameModeIds.length > 0) {
        await tx.insert(gameSubmissionGameModes).values(
          body.gameModeIds.map(gameModeId => ({
            submissionId: submission.id,
            gameModeId,
          }))
        );
      }

      return submission;
    });

    return result;
  } catch (error: unknown) {
    if (isH3ErrorLike(error)) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: "Failed to process game submission",
      data: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});
