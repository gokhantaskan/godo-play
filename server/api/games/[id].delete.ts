import { eq } from "drizzle-orm";

import { db } from "~~/server/db";
import { crossplayInformation, games } from "~~/server/db/schema";
import { isH3ErrorLike } from "~~/server/utils/errorHandler";

export default defineEventHandler(async event => {
  const submissionId = parseInt(event.context.params?.id as string);

  if (isNaN(submissionId)) {
    throw createError({
      statusCode: 400,
      message: "Invalid submission ID",
    });
  }

  try {
    const result = await db.transaction(async tx => {
      // Check if submission exists and is approved
      const submission = await tx.query.games.findFirst({
        where: eq(games.id, submissionId),
      });

      if (!submission) {
        throw createError({
          statusCode: 404,
          message: "Submission not found",
        });
      }

      if (submission.status !== "approved") {
        throw createError({
          statusCode: 400,
          message: "Only approved submissions can be deleted",
        });
      }

      // First delete the crossplay information to resolve the foreign key constraint
      await tx
        .delete(crossplayInformation)
        .where(eq(crossplayInformation.gameId, submissionId));

      // Then delete the game submission
      await tx.delete(games).where(eq(games.id, submissionId));

      return submission;
    });

    return result;
  } catch (error: unknown) {
    if (isH3ErrorLike(error)) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: "Failed to delete game submission",
      data: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});
