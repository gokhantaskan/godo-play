/**
 * Cache handler names assigned to the public game endpoints via
 * `defineCachedEventHandler({ name })`. Nitro stores cached responses under
 * `cache:nitro:handlers:<name>:<key>.json` (after unstorage key normalization),
 * so these names let us target and purge them on mutation.
 */
export const GAME_CACHE_HANDLERS = {
  bySlug: "public-game-by-slug",
  list: "public-games-list",
  recommendations: "public-game-recommendations",
} as const;

/**
 * Invalidates cached public game responses after an admin mutation.
 *
 * The list and recommendation caches fan out across many query combinations,
 * so they are purged wholesale by handler name. The detail cache is keyed by
 * slug but escaped by Nitro (non-word chars stripped), so it is also purged by
 * name prefix to stay robust against that escaping.
 */
export async function invalidateGameCaches() {
  const storage = useStorage();

  await Promise.all(
    Object.values(GAME_CACHE_HANDLERS).map(async name => {
      const prefix = `cache:nitro:handlers:${name}`;
      const keys = await storage.getKeys(prefix);
      await Promise.all(keys.map(key => storage.removeItem(key)));
    })
  );
}
