import { PLATFORM_ICONS } from "~~/shared/constants";
import {
  AgeRatingCategories,
  AgeRatingRatings,
} from "~~/shared/constants/ageRatings";
import type { GameSubmissionWithRelations } from "~~/shared/types";
import type { AgeRating } from "~~/shared/types/igdb/gameDetails";

interface PlatformInfo {
  icon: string;
  name: string;
}

/**
 * Consolidates and organizes platform groups with special handling for PlayStation and Xbox platforms
 *
 * Rules for consolidation:
 * - PlayStation: PS4 and PS5 are combined into "PlayStation" if:
 *   - There's only one group and it has PS4
 *   - Both PS4 and PS5 are present in the same group
 * - Xbox: Xbox One and Series X|S are combined into "Xbox" if:
 *   - There's only one group and it has Xbox One
 *   - Both Xbox One and Series X|S are present in the same group
 *
 * @param platformGroups - Array of platform groups from a game submission
 * @returns Array of sorted platform groups, each containing a record of platform info
 */
export function getConsolidatedPlatformGroups(
  platformGroups: GameSubmissionWithRelations["platformGroups"]
) {
  const isSingleGroup = platformGroups.length === 1;

  const groupsWithPlatforms = platformGroups.map(group => {
    const groupResult: Record<string, PlatformInfo> = {};

    // Handle PlayStation consolidation
    const groupHasPS4 = group.platformGroupPlatforms.some(
      ({ platform }) => platform.slug === "ps4--1"
    );
    const groupHasPS5 = group.platformGroupPlatforms.some(
      ({ platform }) => platform.slug === "ps5"
    );

    // Consolidate PlayStation if it's a single group or both consoles are present
    if ((isSingleGroup && groupHasPS4) || (groupHasPS4 && groupHasPS5)) {
      groupResult["ps"] = {
        icon: PLATFORM_ICONS["ps"] ?? "",
        name: "PlayStation",
      };
    } else {
      if (groupHasPS4) {
        groupResult["ps4--1"] = {
          icon: PLATFORM_ICONS["ps4--1"] ?? "",
          name: "PlayStation 4",
        };
      }
      if (groupHasPS5) {
        groupResult["ps5"] = {
          icon: PLATFORM_ICONS["ps5"] ?? "",
          name: "PlayStation 5",
        };
      }
    }

    // Handle Xbox consolidation
    const groupHasXboxOne = group.platformGroupPlatforms.some(
      ({ platform }) => platform.slug === "xboxone"
    );
    const groupHasXboxSeriesX = group.platformGroupPlatforms.some(
      ({ platform }) => platform.slug === "series-x-s"
    );

    // Consolidate Xbox if it's a single group or both consoles are present
    if (
      (isSingleGroup && groupHasXboxOne) ||
      (groupHasXboxOne && groupHasXboxSeriesX)
    ) {
      groupResult["xbox"] = {
        icon: PLATFORM_ICONS["xbox"] ?? "",
        name: "Xbox",
      };
    } else {
      if (groupHasXboxOne) {
        groupResult["xboxone"] = {
          icon: PLATFORM_ICONS["xboxone"] ?? "",
          name: "Xbox One",
        };
      }
      if (groupHasXboxSeriesX) {
        groupResult["series-x-s"] = {
          icon: PLATFORM_ICONS["series-x-s"] ?? "",
          name: "Xbox Series X|S",
        };
      }
    }

    // Add all other platforms
    for (const { platform } of group.platformGroupPlatforms) {
      const slug = platform.slug;
      // Skip PlayStation and Xbox platforms as they're handled above
      if (["ps4--1", "ps5", "xboxone", "series-x-s"].includes(slug)) {
        continue;
      }

      groupResult[slug] = {
        icon: PLATFORM_ICONS[slug] ?? "",
        name: platform.name,
      };
    }

    // Sort platforms by name within each group
    return {
      platforms: Object.fromEntries(
        Object.entries(groupResult).sort(([, a], [, b]) =>
          a.name.localeCompare(b.name)
        )
      ),
      count: Object.keys(groupResult).length,
    };
  });

  // Sort groups by platform count (descending)
  return groupsWithPlatforms
    .sort((a, b) => b.count - a.count)
    .map(group => group.platforms);
}

/**
 * Gets the human-readable name for an age rating category
 */
function getAgeRatingCategoryName(category: AgeRatingCategories): string {
  return AgeRatingCategories[category];
}

/**
 * Gets the human-readable name for an age rating
 * IGDB's rating_category field uses organization-specific values for ESRB and PEGI,
 * but uses the global enum for other organizations.
 * See: https://api-docs.igdb.com/#age-rating
 */
function getAgeRatingName(
  category: AgeRatingCategories,
  rating: number
): string {
  // ESRB and PEGI use organization-specific rating_category values
  if (category === AgeRatingCategories.ESRB) {
    // ESRB rating_category values observed from IGDB data
    const esrbMap: Record<number, string> = {
      1: "RP", // Rating Pending
      2: "EC", // Early Childhood
      3: "E", // Everyone
      4: "E10", // Everyone 10+
      5: "T", // Teen
      6: "M", // Mature
      7: "AO", // Adults Only
    };

    return esrbMap[rating] || String(rating);
  }

  if (category === AgeRatingCategories.PEGI) {
    // PEGI rating_category values observed from IGDB data
    const pegiMap: Record<number, string> = {
      8: "Three", // PEGI 3
      9: "Seven", // PEGI 7
      10: "Twelve", // PEGI 12
      11: "Sixteen", // PEGI 16
      12: "Eighteen", // PEGI 18
    };

    return pegiMap[rating] || String(rating);
  }

  // Other organizations use the global enum
  const ratingEnum = AgeRatingRatings[rating];

  if (!ratingEnum) {
    return String(rating);
  }

  // Format the rating name (remove underscores, capitalize)
  return ratingEnum
    .split("_")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

interface AgeRatingInfo {
  category: string;
  name: string;
  contentDescriptions: { category: number; description: string }[];
}

/**
 * Consolidates age ratings by category and returns an array of rating information
 *
 * @param ageRatings - Array of age ratings to consolidate
 * @param visibleCategories - Array of category IDs to include (optional)
 * @returns Array of consolidated age ratings with their content descriptions
 */
export function getConsolidatedAgeRatings(
  ageRatings: AgeRating[],
  visibleCategories: AgeRatingCategories[] = [
    AgeRatingCategories.ESRB,
    AgeRatingCategories.PEGI,
  ]
): AgeRatingInfo[] {
  const filteredRatings = visibleCategories
    ? ageRatings.filter(rating => visibleCategories.includes(rating.category))
    : ageRatings;

  const grouped = Object.groupBy(filteredRatings, rating => rating.category);

  return Object.entries(grouped)
    .map(([category, ratings]) => {
      const categoryNum = Number(category);
      const categoryName = getAgeRatingCategoryName(categoryNum);
      // Get the highest rating for the category
      const highestRating = (ratings as AgeRating[]).reduce((max, current) =>
        current.rating > max.rating ? current : max
      );
      const ratingName = getAgeRatingName(categoryNum, highestRating.rating);

      if (import.meta.dev) {
        console.log(
          `Age Rating - Category: ${categoryName} (${category}), Rating: ${ratingName} (${highestRating.rating})`
        );
      }

      return {
        category: categoryName,
        name: ratingName,
        contentDescriptions: [],
      };
    })
    .sort((a, b) => a.category.localeCompare(b.category));
}
