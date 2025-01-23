import { z } from "zod";

export const SubmissionSchema = z.object({
  id: z.number(),
  gameId: z.number(),
  gameName: z.string(),
  gameSlug: z.string(),
  gameImageId: z.string().nullable(),
  status: z.enum(["pending", "approved", "rejected"]),
  createdAt: z.date(),
  updatedAt: z.date(),
  platformGroups: z.array(
    z.object({
      id: z.number(),
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
  gameSubmissionGameModes: z.array(
    z.object({
      submissionId: z.number(),
      gameModeId: z.number(),
      gameMode: z.object({
        id: z.number(),
        name: z.string(),
        slug: z.string(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    })
  ),
});

export const SubmissionResponseSchema = z.array(SubmissionSchema);

export type Submission = z.infer<typeof SubmissionSchema>;
export type SubmissionResponse = z.infer<typeof SubmissionResponseSchema>;
