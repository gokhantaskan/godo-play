export const SUPPORTED_GAME_MODES: {
  id: number;
  name: string;
  slug: string;
  [key: string]: string | number;
}[] = [
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
    id: 6,
    name: "Battle Royale",
    slug: "battle-royale",
  },
  {
    id: 5,
    name: "MMO",
    slug: "massively-multiplayer-online-mmo",
  },
  {
    id: 100,
    name: "Team-Based",
    slug: "team-based",
  },
  {
    id: 101,
    name: "PvP",
    slug: "pvp",
  },
  {
    id: 102,
    name: "PvE",
    slug: "pve",
  },
  {
    id: 103,
    name: "Online Co-op",
    slug: "online-co-op",
  },
  {
    id: 105,
    name: "Asynchronous multiplayer",
    slug: "asynchronous-multiplayer",
  },
  {
    id: 106,
    name: "Campaign Co-op",
    slug: "campaign-co-op",
  },
  {
    id: 108,
    name: "Score Attack / Time Trial",
    slug: "score-attack-time-trial",
  },
  {
    id: 104,
    name: "Couch / Local Co-op",
    slug: "couch-co-op",
  },
];

export const GAME_MODE_IDS: number[] = SUPPORTED_GAME_MODES.map(tag => tag.id);
