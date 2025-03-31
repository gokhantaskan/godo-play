import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "~~/server/db";
import {
  crossplayInformation,
  games,
  gamesTags,
  gameSubmissionGameModes,
  platformGroupPlatforms,
  platformGroups,
  storeCrossplayPlatforms,
  storePlatforms,
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
const updateSubmissionSchema = z.object({
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

type RequestBody = z.infer<typeof updateSubmissionSchema>;

export default defineEventHandler(async event => {
  const submissionId = parseInt(event.context.params?.id as string);

  if (isNaN(submissionId)) {
    throw createError({
      statusCode: 400,
      message: "Invalid submission ID",
    });
  }

  try {
    // Validate request body
    const body = await readBody<RequestBody>(event);
    console.log("game patch", body);
    updateSubmissionSchema.parse(body);

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

      // Delete and process platform groups only if provided
      if (body.platformGroups) {
        await tx
          .delete(platformGroups)
          .where(eq(platformGroups.submissionId, submissionId));

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
      }

      // Process PC store platforms only if provided
      if (body.storesPlatforms) {
        await tx
          .delete(storePlatforms)
          .where(eq(storePlatforms.submissionId, submissionId));

        for (const [
          storeSlug,
          { crossplayPlatforms, storeUrl },
        ] of Object.entries(body.storesPlatforms)) {
          const [store] = await tx
            .insert(storePlatforms)
            .values(
              InsertStorePlatformSchema.parse({
                submissionId,
                storeSlug,
                storeUrl,
              })
            )
            .returning();

          if (!store) {
            throw createError({
              statusCode: 500,
              message: "Failed to create PC store platform",
            });
          }

          if (crossplayPlatforms.length > 0) {
            await tx.insert(storeCrossplayPlatforms).values(
              crossplayPlatforms.map(platformId =>
                InsertStoreCrossplayPlatformSchema.parse({
                  storePlatformId: store.id,
                  platformId,
                })
              )
            );
          }
        }
      }

      // Process game modes only if provided
      if (body.gameModeIds) {
        await tx
          .delete(gameSubmissionGameModes)
          .where(eq(gameSubmissionGameModes.submissionId, submissionId));

        if (body.gameModeIds.length > 0) {
          await tx.insert(gameSubmissionGameModes).values(
            body.gameModeIds.map(gameModeId => ({
              submissionId,
              gameModeId,
            }))
          );
        }
      }

      // Process tags if provided
      if (body.tagIds !== undefined) {
        await tx.delete(gamesTags).where(eq(gamesTags.gameId, submissionId));

        if (body.tagIds.length > 0) {
          await tx.insert(gamesTags).values(
            body.tagIds.map(tagId => ({
              gameId: submissionId,
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
          console.log("Setting freeToPlay to:", body.freeToPlay);
        }

        const [updatedGame] = await tx
          .update(games)
          .set(updateData)
          .where(eq(games.id, submissionId))
          .returning();

        console.log("Updated game:", updatedGame);

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
              where: eq(crossplayInformation.gameId, submissionId),
            });

          if (body.crossplayInformation === null) {
            if (existingCrossplay) {
              await tx
                .delete(crossplayInformation)
                .where(eq(crossplayInformation.gameId, submissionId));
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
                .where(eq(crossplayInformation.gameId, submissionId));
            } else {
              await tx.insert(crossplayInformation).values({
                gameId: submissionId,
                evidenceUrl: body.crossplayInformation.evidenceUrl,
                information: body.crossplayInformation.information,
                isOfficial: body.crossplayInformation.isOfficial ?? false,
              });
            }
          }
        }
      }

      return submission;
    });

    return result;
  } catch (error) {
    console.error("game patch error", error);

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
