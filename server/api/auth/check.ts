export default defineEventHandler(async () => {
  const session = await tokenStorage.getSession();

  return {
    hasToken: !!session,
    expiresAt: session?.expires_at,
    isExpired: session ? session.expires_at <= Date.now() : true,
  };
});
