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
    slug: "epic_game_store",
    label: "Epic Games Store",
    icon: "stores:egs",
  },
  {
    id: null,
    slug: "battle_net",
    label: "Battle.net",
    icon: "stores:battle_net",
  },
  {
    id: null,
    slug: "origin",
    label: "Origin",
    icon: "stores:origin",
  },
] as const;

export const SUPPORTED_PC_STORE_IDS = SUPPORTED_PC_STORES.map(
  store => store.slug
);
