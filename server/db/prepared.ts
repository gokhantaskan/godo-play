import { eq, sql } from "drizzle-orm";

import { db } from "./index";
import { games } from "./schema";

export const getGameBySlugPrepared = db.query.games
  .findFirst({
    where: eq(games.slug, sql.placeholder("slug")),
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
          storeUrl: true,
        },
        with: {
          store: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
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
      gameGameModes: {
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
  })
  .prepare("get_game_by_slug");
