export const GAME_MODES: {
  id: number;
  name: string;
  slug: string;
}[] = [
  // IGDB (keep as-is)
  {
    id: 1,
    name: "Single player",
    slug: "single-player",
  },
  {
    id: 2,
    name: "Multiplayer",
    slug: "multiplayer",
  },
  {
    id: 3,
    name: "Co-operative",
    slug: "co-operative",
  },
  {
    id: 4,
    name: "Split screen",
    slug: "split-screen",
  },
  {
    id: 5,
    name: "MMO",
    slug: "massively-multiplayer-online-mmo",
  },
  {
    id: 6,
    name: "Battle Royale",
    slug: "battle-royale",
  },
  // Custom
  {
    id: 100,
    name: "Campaign",
    slug: "campaign",
  },
  {
    id: 101,
    name: "Competitive",
    slug: "competitive",
  },
  {
    id: 102,
    name: "Local & Party",
    slug: "local-and-party",
  },
  {
    id: 103,
    name: "PvP",
    slug: "pvp",
  },
  {
    id: 104,
    name: "PvE",
    slug: "pve",
  },
  {
    id: 105,
    name: "Time Trial / Score Attack",
    slug: "time-trial-score-attack",
  },
  {
    id: 106,
    name: "Sandbox / Creative",
    slug: "sandbox-creative",
  },
];

export const EXTERNAL_GAME_MODES = GAME_MODES.filter(mode => mode.id < 100);
export const GAME_MODE_IDS: number[] = GAME_MODES.map(tag => tag.id);
