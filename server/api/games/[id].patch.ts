import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "~~/server/db";
import {
  games,
  gameSubmissionGameModes,
  pcStoreCrossplayPlatforms,
  pcStorePlatforms,
  platformGroupPlatforms,
  platformGroups,
} from "~~/server/db/schema";
import { isH3ErrorLike } from "~~/server/utils/errorHandler";
import {
  InsertPcStoreCrossplayPlatformSchema,
  InsertPcStorePlatformSchema,
} from "~~/shared/schemas/pcStorePlatform";
import {
  InsertPlatformGroupPlatformsSchema,
  InsertPlatformGroupSchema,
} from "~~/shared/schemas/platformGroup";

// Validate the request body
const updateSubmissionSchema = z.object({
  category: z.number().optional(),
  platformGroups: z
    .array(z.array(z.number()))
    .min(1, "At least one platform group is required")
    .refine(groups => groups.every(group => group.length > 0), {
      message: "Each platform group must contain at least one platform",
    }),
  pcStoresPlatforms: z.record(
    z.string(),
    z.object({
      crossplayPlatforms: z.array(z.number()).default([]),
    })
  ),
  gameModeIds: z.array(z.number()).min(1, "At least one game mode is required"),
});

type RequestBody = z.infer<typeof updateSubmissionSchema>;

export default defineEventHandler(async event => {
  const submissionId = parseInt(event.context.params?.id as string);

  if (isNaN(submissionId)) {
    throw createError({
      statusCode: 400,
      message: "Invalid submission ID",
    });
  }

  let body: RequestBody;
  try {
    body = await readBody<RequestBody>(event);
    updateSubmissionSchema.parse(body);
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
    const result = await db.transaction(async tx => {
      // Check if submission exists
      const submission = await tx.query.games.findFirst({
        where: eq(games.id, submissionId),
      });

      if (!submission) {
        throw createError({
          statusCode: 404,
          message: "Submission not found",
        });
      }

      // Delete existing platform groups, PC store platforms, and game modes
      await tx
        .delete(platformGroups)
        .where(eq(platformGroups.submissionId, submissionId));
      await tx
        .delete(pcStorePlatforms)
        .where(eq(pcStorePlatforms.submissionId, submissionId));
      await tx
        .delete(gameSubmissionGameModes)
        .where(eq(gameSubmissionGameModes.submissionId, submissionId));

      // Process all insertions sequentially to maintain atomicity
      for (const groupPlatforms of body.platformGroups) {
        const [group] = await tx
          .insert(platformGroups)
          .values(
            InsertPlatformGroupSchema.parse({
              submissionId,
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
        body.pcStoresPlatforms
      )) {
        const [pcStore] = await tx
          .insert(pcStorePlatforms)
          .values(
            InsertPcStorePlatformSchema.parse({
              submissionId,
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
          await tx.insert(pcStoreCrossplayPlatforms).values(
            crossplayPlatforms.map(platformId =>
              InsertPcStoreCrossplayPlatformSchema.parse({
                pcStorePlatformId: pcStore.id,
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
            submissionId,
            gameModeId,
          }))
        );
      }

      // Update category if provided
      if (body.category !== undefined) {
        const [updatedGame] = await tx
          .update(games)
          .set({ category: body.category })
          .where(eq(games.id, submissionId))
          .returning();

        if (!updatedGame) {
          throw createError({
            statusCode: 500,
            message: "Failed to update game category",
          });
        }
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
      message: "Failed to update game submission",
      data: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});
