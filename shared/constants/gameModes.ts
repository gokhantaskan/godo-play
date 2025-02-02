export const SUPPORTED_GAME_MODES: {
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
];

export const GAME_MODE_IDS: number[] = SUPPORTED_GAME_MODES.map(tag => tag.id);
