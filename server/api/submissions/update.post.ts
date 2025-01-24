import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "~~/server/db";
import { games } from "~~/server/db/schema";
import { isH3ErrorLike } from "~~/server/utils/errorHandler";

const updateSubmissionSchema = z.object({
  id: z.number(),
  status: z.enum(["approved", "rejected"]),
});

type RequestBody = z.infer<typeof updateSubmissionSchema>;

export default defineEventHandler(async event => {
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
    const [submission] = await db
      .update(games)
      .set({ status: body.status })
      .where(eq(games.id, body.id))
      .returning();

    if (!submission) {
      throw createError({
        statusCode: 404,
        message: "Submission not found",
      });
    }

    return submission;
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
