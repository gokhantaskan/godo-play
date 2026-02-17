export default defineEventHandler(async () => {
  try {
    const session = await tokenStorage.getSession();

    return {
      hasToken: !!session,
      expiresAt: session?.expires_at,
      isExpired: session ? session.expires_at <= Date.now() : true,
    };
  } catch (error) {
    throwApiError(error);
  }
});
