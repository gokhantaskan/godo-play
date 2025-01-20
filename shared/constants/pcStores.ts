// IGDB PC Stores + Local Stores
export const SUPPORTED_PC_STORES = [
  {
    id: 1,
    slug: "steam",
    label: "Steam",
    icon: "stores:steam",
  },
  {
    id: 5,
    slug: "gog",
    label: "GOG",
    icon: "stores:gog",
  },
  {
    id: 11,
    slug: "microsoft",
    label: "Microsoft Store",
    icon: "stores:ms",
  },
  {
    id: 26,
    slug: "epic_game_store", // Keep it as epic_game_store as it is in IGDB
    label: "Epic Games Store",
    icon: "stores:egs",
  },
  // Local Stores
  {
    id: 1000,
    slug: "battlenet",
    label: "Battle.net",
    icon: "stores:battlenet",
  },
  {
    id: 1001,
    slug: "origin",
    label: "Origin",
    icon: "stores:origin",
  },
] as const;

export const SUPPORTED_PC_STORE_IDS = SUPPORTED_PC_STORES.map(
  store => store.slug
);
