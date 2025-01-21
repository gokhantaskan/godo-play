import { inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../db";
import {
  gameSubmissions,
  pcStoreCrossplayPlatforms,
  pcStorePlatforms,
  platformGroupPlatforms,
  platformGroups,
  platforms,
} from "../../db/schema";

// Validate the request body
const submitGameSchema = z.object({
  game: z.object({
    id: z.number(),
    name: z.string().min(1, "Game name is required"),
    slug: z.string().min(1, "Game slug is required"),
    imageId: z.string().optional(),
  }),
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
  token: z.string().min(1, "reCAPTCHA token is required"),
});

const SubmissionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    id: z.number(),
    gameId: z.number(),
    gameName: z.string(),
    gameSlug: z.string(),
    gameImageId: z.string().nullable(),
    status: z.enum(["pending", "approved", "rejected"]),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
});

type RequestBody = z.infer<typeof submitGameSchema>;
type SubmissionResponse = z.infer<typeof SubmissionResponseSchema>;

interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export default defineEventHandler(async event => {
  try {
    const body = await readBody<RequestBody>(event);

    // Validate request body
    const validatedData = submitGameSchema.parse(body);

    // Verify reCAPTCHA token
    const config = useRuntimeConfig();
    const recaptchaSecret = config.google.recaptcha.secretKey;

    if (!recaptchaSecret) {
      throw createError({
        statusCode: 500,
        message: "reCAPTCHA secret key is not configured",
      });
    }

    const recaptchaResponse = await $fetch<RecaptchaResponse>(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        body: new URLSearchParams({
          secret: recaptchaSecret,
          response: validatedData.token,
        }),
      }
    );

    if (!recaptchaResponse.success) {
      throw createError({
        statusCode: 400,
        message: "Invalid reCAPTCHA token",
        data: recaptchaResponse["error-codes"],
      });
    }

    // Start a transaction
    const result = await db.transaction(async tx => {
      // Insert game submission
      const [submission] = await tx
        .insert(gameSubmissions)
        .values({
          gameId: validatedData.game.id,
          gameName: validatedData.game.name,
          gameSlug: validatedData.game.slug,
          gameImageId: validatedData.game.imageId,
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
      validatedData.platformGroups.forEach(group => {
        group.forEach(platformId => platformIdsSet.add(platformId));
      });

      // From PC store crossplay platforms
      Object.values(validatedData.pcStoresPlatforms).forEach(storeData => {
        storeData.crossplayPlatforms.forEach(platformId =>
          platformIdsSet.add(platformId)
        );
      });

      const platformIds = Array.from(platformIdsSet);

      // Ensure platforms exist in the `platforms` table
      const existingPlatforms = await tx
        .select({ id: platforms.id })
        .from(platforms)
        .where(inArray(platforms.id, platformIds));

      const existingPlatformIds = existingPlatforms.map(p => p.id);
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

      // Insert platform groups and their platforms
      await Promise.all(
        validatedData.platformGroups.map(async (groupPlatforms: number[]) => {
          const [group] = await tx
            .insert(platformGroups)
            .values({
              submissionId: submission.id,
            })
            .returning();

          if (!group) {
            throw createError({
              statusCode: 500,
              message: "Failed to create platform group",
            });
          }

          if (groupPlatforms.length > 0) {
            try {
              await tx.insert(platformGroupPlatforms).values(
                groupPlatforms.map(platformId => ({
                  platformGroupId: group.id,
                  platformId: platformId,
                }))
              );
            } catch (error) {
              throw createError({
                statusCode: 500,
                message: "Failed to associate platforms with group",
                data: error,
              });
            }
          }
        })
      );

      // Insert PC store platforms and their crossplay platforms
      await Promise.all(
        Object.entries(validatedData.pcStoresPlatforms).map(
          async ([storeSlug, { crossplayPlatforms }]) => {
            const [pcStore] = await tx
              .insert(pcStorePlatforms)
              .values({
                submissionId: submission.id,
                storeSlug,
              })
              .returning();

            if (!pcStore) {
              throw createError({
                statusCode: 500,
                message: "Failed to create PC store platform",
              });
            }

            if (crossplayPlatforms.length > 0) {
              try {
                await tx.insert(pcStoreCrossplayPlatforms).values(
                  crossplayPlatforms.map(platformId => ({
                    pcStorePlatformId: pcStore.id,
                    platformId: platformId,
                  }))
                );
              } catch (error) {
                throw createError({
                  statusCode: 500,
                  message: "Failed to associate crossplay platforms",
                  data: error,
                });
              }
            }
          }
        )
      );

      const response: SubmissionResponse = {
        success: true,
        message: "Game submission created successfully",
        data: {
          ...submission,
          createdAt: new Date(submission.createdAt),
          updatedAt: new Date(submission.updatedAt),
        },
      };

      return SubmissionResponseSchema.parse(response);
    });

    return result;
  } catch (error: unknown) {
    console.error("Game submission error:", error);

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: "Invalid request data",
        data: error.errors,
      });
    }

    // If it's already a H3 error, just rethrow it
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: "Failed to create game submission",
    });
  }
});
