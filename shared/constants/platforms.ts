// IGDB Platforms
export const PLATFORMS = [
  {
    id: 6,
    abbreviation: "PC",
    name: "PC (Windows)",
    slug: "win",
  },
  // {
  //   id: 14,
  //   abbreviation: "Mac",
  //   name: "Mac",
  //   slug: "mac",
  // },
  {
    id: 48,
    abbreviation: "PS4",
    name: "PlayStation 4",
    slug: "ps4--1",
  },
  {
    id: 167,
    abbreviation: "PS5",
    name: "PlayStation 5",
    slug: "ps5",
  },
  {
    id: 169,
    abbreviation: "Series X|S",
    name: "Xbox Series X|S",
    slug: "series-x-s",
  },
  {
    id: 130,
    abbreviation: "Switch",
    name: "Nintendo Switch",
    slug: "switch",
  },
];

export const SUPPORTED_PLATFORM_IDS = PLATFORMS.map(platform => platform.id);
