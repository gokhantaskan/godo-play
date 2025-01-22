interface H3ErrorLike {
  statusCode: number;
  message: string;
}

export default defineEventHandler(async () => {
  try {
    const session = await tokenStorage.getSession();

    return {
      hasToken: !!session,
      expiresAt: session?.expires_at,
      isExpired: session ? session.expires_at <= Date.now() : true,
    };
  } catch (error: unknown) {
    if (isH3ErrorLike(error)) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: "Failed to check session status",
      data: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});

function isH3ErrorLike(error: unknown): error is H3ErrorLike {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    "message" in error
  );
}
