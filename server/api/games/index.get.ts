import createDOMPurify from "dompurify";
import { and, asc, count, desc, inArray, sql } from "drizzle-orm";
import { JSDOM } from "jsdom";

import { db } from "~~/server/db";
import {
  games,
  gameSubmissionGameModes,
  platformGroupPlatforms,
} from "~~/server/db/schema";
import { isH3ErrorLike } from "~~/server/utils/errorHandler";
import type { GameSubmissionWithRelations } from "~~/shared/types";
import type {
  FilterParams,
  PaginatedResponse,
  SubmissionStatus,
} from "~~/shared/types/globals";

// Define the sortable fields type
type SortableField =
  | "created_at"
  | "updated_at"
  | "popularity"
  | "first_release_date";

interface CountResult {
  count: number; // Count result from database query
}

// Initialize DOMPurify with jsdom
const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

// Helper function to parse array parameters from query
function parseArrayParam(param?: string): number[] | undefined {
  // Decode URI component and split by comma, then convert to numbers
  return param ? decodeURIComponent(param).split(",").map(Number) : undefined;
}

// Helper function to sanitize HTML content
function sanitizeHtml(html: string | null): string | null {
  if (!html) {
    return null;
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "ul",
      "ol",
      "li",
      "a",
      "h3",
      "h4",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
}

export default defineCachedEventHandler(
  async event => {
    try {
      // Extract query parameters from the event
      const query = getQuery(event);
      const {
        platforms,
        gameModes,
        limit = "60", // Default limit
        offset = "0", // Default offset
        search,
        status,
        sort = "-popularity", // Default sort
      } = query as Partial<Record<keyof FilterParams, string>>;

      // Parse query parameters
      const parsedPlatforms = parseArrayParam(platforms);
      const parsedGameModes = parseArrayParam(gameModes);
      const parsedLimit = parseInt(limit);
      const parsedOffset = parseInt(offset);

      // Parse sort parameter
      const sortField = sort.slice(1) as SortableField; // Remove +/- prefix
      const isDescending = sort.startsWith("-");
      const validSortFields = [
        "created_at",
        "updated_at",
        "popularity",
        "first_release_date",
      ] as const satisfies readonly SortableField[];

      const parsedSortField = validSortFields.includes(sortField as any)
        ? sortField
        : "popularity";

      // Parse and validate status parameter
      const validStatuses = status
        ? decodeURIComponent(status)
            .split(",")
            .filter((s): s is SubmissionStatus =>
              ["pending", "approved", "rejected"].includes(s)
            )
        : undefined;

      // Base conditions for filtered queries
      const baseConditions = {
        where: validStatuses?.length
          ? inArray(games.status, validStatuses)
          : undefined,
      };

      let conditions = baseConditions.where;

      // Add search filtering condition
      if (search) {
        const decodedSearch = decodeURIComponent(search);
        conditions = and(conditions, sql`name ILIKE ${`%${decodedSearch}%`}`);
      }

      // Add platform filtering condition
      if (parsedPlatforms?.length) {
        // Get all platform groups that contain any of the requested platforms
        const platformGroups = await db.query.platformGroupPlatforms.findMany({
          where: inArray(platformGroupPlatforms.platformId, parsedPlatforms),
          with: {
            platformGroup: {
              columns: {
                id: true,
                submissionId: true,
              },
            },
          },
        });

        // Group platform groups by submission ID
        const submissionToPlatformGroups = new Map<number, Set<number>>();

        platformGroups.forEach(pg => {
          const submissionId = pg.platformGroup.submissionId;
          const platformId = pg.platformId;

          if (!submissionToPlatformGroups.has(submissionId)) {
            submissionToPlatformGroups.set(submissionId, new Set());
          }

          submissionToPlatformGroups.get(submissionId)?.add(platformId);
        });

        // Filter submissions that have all requested platforms
        const matchingSubmissionIds = Array.from(
          submissionToPlatformGroups.entries()
        )
          .filter(([_, platformIds]) =>
            parsedPlatforms.every(platformId => platformIds.has(platformId))
          )
          .map(([submissionId, _]) => submissionId);

        // Only apply the filter if we found matching submissions
        if (matchingSubmissionIds.length > 0) {
          conditions = and(
            conditions,
            inArray(games.id, matchingSubmissionIds)
          );
        } else {
          // If no matching submissions, return no results
          conditions = and(conditions, sql`false`);
        }
      }

      // Update game mode filtering to include at least one selected mode
      if (parsedGameModes?.length) {
        const gameModeQuery = db
          .select({ submissionId: gameSubmissionGameModes.submissionId })
          .from(gameSubmissionGameModes)
          // .where(inArray(gameSubmissionGameModes.gameModeId, parsedGameModes))
          // .groupBy(gameSubmissionGameModes.submissionId)
          // .having(
          //   sql`COUNT(DISTINCT game_mode_id) = ${parsedGameModes.length}`
          // )
          .where(inArray(gameSubmissionGameModes.gameModeId, parsedGameModes));

        conditions = and(conditions, sql`id IN (${gameModeQuery})`);
      }

      // Get filtered count of games
      const filteredCountResult = await db
        .select({ count: count() })
        .from(games)
        .where(conditions)
        .then(rows => rows[0] as CountResult);

      // Retrieve filtered game data with related entities
      const data = await db.query.games.findMany({
        with: {
          crossplayInformation: true,
          platformGroups: {
            columns: {
              id: true,
            },
            with: {
              platformGroupPlatforms: {
                columns: {
                  platformId: true,
                  platformGroupId: true,
                },
                with: {
                  platform: {
                    columns: {
                      id: true,
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
          storePlatforms: {
            columns: {
              id: true,
              storeSlug: true,
              storeUrl: true,
            },
            with: {
              crossplayEntries: {
                columns: {
                  platformId: true,
                },
                with: {
                  platform: {
                    columns: {
                      id: true,
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
          gameSubmissionGameModes: {
            columns: {
              gameModeId: true,
            },
            with: {
              gameMode: {
                columns: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          tags: {
            with: {
              tag: {
                columns: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
        where: conditions,
        orderBy: [
          parsedSortField === "popularity"
            ? sql`(external->>'igdbAggregatedRating')::float DESC NULLS LAST`
            : parsedSortField === "first_release_date"
              ? isDescending
                ? sql`first_release_date DESC NULLS LAST`
                : sql`first_release_date ASC NULLS LAST`
              : isDescending
                ? desc(
                    games[
                      parsedSortField === "created_at"
                        ? "createdAt"
                        : "updatedAt"
                    ]
                  )
                : asc(
                    games[
                      parsedSortField === "created_at"
                        ? "createdAt"
                        : "updatedAt"
                    ]
                  ),
        ],
        limit: parsedLimit,
        offset: parsedOffset,
      });

      // Sanitize HTML content in crossplay information
      const sanitizedData = data.map(game => {
        const sanitizedCrossplayInfo = game.crossplayInformation
          ? {
              evidenceUrl: game.crossplayInformation.evidenceUrl,
              information: sanitizeHtml(game.crossplayInformation.information),
              isOfficial: game.crossplayInformation.isOfficial,
            }
          : null;

        return {
          ...game,
          crossplayInformation: sanitizedCrossplayInfo,
        };
      }) as GameSubmissionWithRelations[];

      // Return the response with total, count, and sanitized data
      return {
        total: filteredCountResult.count,
        count: sanitizedData.length,
        data: sanitizedData,
        limit: parsedLimit,
        offset: parsedOffset,
      } satisfies PaginatedResponse<GameSubmissionWithRelations>;
    } catch (error: unknown) {
      // Handle errors and throw appropriate error messages
      if (isH3ErrorLike(error)) {
        throw error;
      }

      throw createError({
        statusCode: 500,
        message: "Failed to retrieve game submissions",
        data: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  },
  {
    // Cache settings: 5 minutes in production, 5 seconds in development
    maxAge: process.env.NODE_ENV === "production" ? 5 * 60 : 5,
    swr: false,
  }
);
