import type { GameStoreHardcoded } from "~~/shared/types/globals";

// IGDB PC Stores + Local Stores
export const SUPPORTED_PC_STORES: GameStoreHardcoded[] = [
  {
    id: 1,
    slug: "steam",
    name: "Steam",
    icon: "stores:steam",
  },
  {
    id: 5,
    slug: "gog",
    name: "GOG",
    icon: "stores:gog",
  },
  {
    id: 11,
    slug: "microsoft",
    name: "Microsoft Store",
    icon: "stores:ms",
  },
  {
    id: 26,
    slug: "epic_game_store", // Keep it as epic_game_store as it is in IGDB
    name: "Epic Games Store",
    icon: "stores:egs",
  },
  // Local Stores
  {
    id: 1000,
    slug: "battlenet",
    name: "Battle.net",
    icon: "stores:battlenet",
  },
  {
    id: 1001,
    slug: "origin",
    name: "EA Play (Origin)",
    icon: "stores:origin",
  },
  {
    id: 1002,
    slug: "uconnect",
    name: "Ubisoft Connect",
    icon: "stores:uconnect",
  },
];

export const SUPPORTED_PC_STORES_BY_SLUG = SUPPORTED_PC_STORES.reduce(
  (acc, store) => {
    acc[store.slug] = store;
    return acc;
  },
  {} as Record<string, GameStoreHardcoded>
);

export const SUPPORTED_PC_STORE_IDS = SUPPORTED_PC_STORES.map(
  store => store.slug
);
