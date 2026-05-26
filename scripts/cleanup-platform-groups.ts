/**
 * Cleans up malformed platform groups created before write-side sanitization:
 * - empty groups (no platforms)
 * - duplicate groups within a game (identical platform-id sets)
 *
 * Junction rows (platform_group_platform) cascade on group delete, so removing
 * the offending platform_group rows is sufficient.
 *
 * Usage:
 *   pnpm tsx scripts/cleanup-platform-groups.ts            # dry run (default)
 *   pnpm tsx scripts/cleanup-platform-groups.ts --apply    # perform deletes
 */
import { config } from "dotenv";
import { expand } from "dotenv-expand";

// Load env before importing the db module (it reads POSTGRES_URL at import time).
// Set DOTENV_CONFIG_PATH to target a specific env file (e.g. .env.production).
expand(config({ override: true, path: process.env.DOTENV_CONFIG_PATH }));

async function main() {
  const isApply = process.argv.includes("--apply");

  const { inArray } = await import("drizzle-orm");
  const { db } = await import("../server/db");
  const { platformGroups } = await import("../server/db/schema");

  const groups = await db.query.platformGroups.findMany({
    columns: { id: true, gameId: true },
    with: {
      platformGroupPlatforms: { columns: { platformId: true } },
    },
  });

  // Bucket groups by game so duplicate detection is scoped per game
  const byGame = new Map<number, typeof groups>();
  for (const group of groups) {
    const bucket = byGame.get(group.gameId) ?? [];
    bucket.push(group);
    byGame.set(group.gameId, bucket);
  }

  const emptyIds: number[] = [];
  const duplicateIds: number[] = [];

  for (const gameGroups of byGame.values()) {
    const seenSignatures = new Set<string>();

    for (const group of gameGroups) {
      const platformIds = group.platformGroupPlatforms.map(p => p.platformId);

      if (platformIds.length === 0) {
        emptyIds.push(group.id);
        continue;
      }

      const signature = [...new Set(platformIds)]
        .sort((a, b) => a - b)
        .join(",");

      if (seenSignatures.has(signature)) {
        duplicateIds.push(group.id);
        continue;
      }

      seenSignatures.add(signature);
    }
  }

  const toDelete = [...emptyIds, ...duplicateIds];

  console.log(
    `Scanned ${groups.length} platform groups across ${byGame.size} games`
  );
  console.log(`Empty groups:     ${emptyIds.length}`);
  console.log(`Duplicate groups: ${duplicateIds.length}`);
  console.log(`To delete:        ${toDelete.length}`);

  if (toDelete.length === 0) {
    console.log("Nothing to clean up.");
    process.exit(0);
  }

  if (!isApply) {
    console.log("\nDry run — group ids that would be deleted:");
    console.log(toDelete.join(", "));
    console.log("\nRe-run with --apply to delete.");
    process.exit(0);
  }

  await db.delete(platformGroups).where(inArray(platformGroups.id, toDelete));
  console.log(`\nDeleted ${toDelete.length} platform groups.`);
  process.exit(0);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
