import { desc } from "drizzle-orm";
import { z } from "zod";

import { db } from "~~/server/db";
import { gameSubmissions } from "~~/server/db/schema";

const SubmissionResponseSchema = z.object({
  submissions: z.array(
    z.object({
      id: z.number(),
      gameId: z.string(),
      gameName: z.string(),
      gameSlug: z.string(),
      gameImageId: z.string().nullable(),
      status: z.enum(["pending", "approved", "rejected"]),
      createdAt: z.date(),
      updatedAt: z.date(),
      platformGroups: z.array(
        z.object({
          id: z.number(),
          groupName: z.string(),
          platformGroupPlatforms: z.array(
            z.object({
              platform: z.object({
                id: z.number(),
                name: z.string(),
                slug: z.string(),
              }),
            })
          ),
        })
      ),
      pcStorePlatforms: z.array(
        z.object({
          id: z.number(),
          storeSlug: z.string(),
          crossplayEntries: z.array(
            z.object({
              platform: z.object({
                id: z.number(),
                name: z.string(),
                slug: z.string(),
              }),
            })
          ),
        })
      ),
    })
  ),
});

type SubmissionResponse = z.infer<typeof SubmissionResponseSchema>;

export default defineEventHandler(async () => {
  try {
    const rawSubmissions = await db.query.gameSubmissions.findMany({
      with: {
        platformGroups: {
          with: {
            platformGroupPlatforms: {
              with: {
                platform: true,
              },
            },
          },
        },
        pcStorePlatforms: {
          with: {
            crossplayEntries: {
              with: {
                platform: true,
              },
            },
          },
        },
      },
      orderBy: [desc(gameSubmissions.updatedAt)],
    });

    const submissions = rawSubmissions.map(submission => ({
      ...submission,
      createdAt: new Date(submission.createdAt),
      updatedAt: new Date(submission.updatedAt),
    }));

    const response: SubmissionResponse = { submissions };
    return SubmissionResponseSchema.parse(response);
  } catch (error) {
    console.error("Failed to fetch submissions:", error);

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 500,
        message: "Invalid data format from database",
        data: error.errors,
      });
    }

    throw createError({
      statusCode: 500,
      message: "Failed to fetch submissions",
    });
  }
});
