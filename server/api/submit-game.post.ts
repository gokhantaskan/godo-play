import { z } from "zod";

import { db } from "../db";
import {
  gameSubmissions,
  pcStorePlatforms,
  platformGroups,
} from "../db/schema";

// Validate the request body
const submitGameSchema = z.object({
  game: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    imageId: z.string().optional(),
  }),
  platformGroups: z.array(z.array(z.number())),
  pcStoresPlatforms: z.record(
    z.object({
      crossplayPlatforms: z.array(z.number()).default([]),
    })
  ),
  token: z.string(),
});

type RequestBody = z.infer<typeof submitGameSchema>;

interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export default defineEventHandler(async event => {
  const body = await readBody<RequestBody>(event);

  try {
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
      });
    }

    // Start a transaction
    return await db.transaction(async tx => {
      // Insert game submission
      const [submission] = await tx
        .insert(gameSubmissions)
        .values({
          gameId: String(validatedData.game.id),
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

      // Insert platform groups
      await Promise.all(
        validatedData.platformGroups.map((platforms: number[]) =>
          tx.insert(platformGroups).values({
            submissionId: submission.id,
            platforms,
          })
        )
      );

      // Insert PC store platforms
      await Promise.all(
        Object.entries(validatedData.pcStoresPlatforms).map(
          ([storeSlug, { crossplayPlatforms }]) =>
            tx.insert(pcStorePlatforms).values({
              submissionId: submission.id,
              storeSlug,
              crossplayPlatforms,
            })
        )
      );

      return {
        success: true,
        message: "Game submission created successfully",
        data: submission,
      };
    });
  } catch (error: unknown) {
    console.error("Game submission error:", error);

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: "Invalid request data",
        data: error.errors,
      });
    }

    throw createError({
      statusCode: 500,
      message: "Failed to create game submission",
    });
  }
});
