export const SUPPORTED_PC_STORES = [
  {
    id: 1,
    slug: "steam",
    label: "Steam",
  },
  {
    id: 5,
    slug: "gog",
    label: "GOG",
  },
  {
    id: 11,
    slug: "microsoft",
    label: "Microsoft Store",
  },
  {
    id: 26,
    slug: "epic_game_store",
    label: "Epic Games Store",
  },
  {
    id: null,
    slug: "battle_net",
    label: "Battle.net",
  },
  {
    id: null,
    slug: "origin",
    label: "Origin",
  },
] as const;

export const SUPPORTED_PC_STORE_IDS = SUPPORTED_PC_STORES.map(
  store => store.slug
);
