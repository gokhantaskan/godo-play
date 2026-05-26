/**
 * Normalizes incoming platform groups before persistence.
 *
 * Admin/submission forms can produce empty groups (no platforms) and duplicate
 * groups (identical platform sets). Persisting those yields empty/duplicate
 * platform boxes in the UI, so we:
 * - drop duplicate platform ids within a group
 * - drop empty groups
 * - drop duplicate groups (same set of platform ids, order-independent)
 */
export function sanitizePlatformGroups(groups: number[][]): number[][] {
  const seen = new Set<string>();
  const result: number[][] = [];

  for (const group of groups) {
    const uniquePlatformIds = [...new Set(group)];
    if (uniquePlatformIds.length === 0) {
      continue;
    }

    const signature = [...uniquePlatformIds].sort((a, b) => a - b).join(",");
    if (seen.has(signature)) {
      continue;
    }

    seen.add(signature);
    result.push(uniquePlatformIds);
  }

  return result;
}
