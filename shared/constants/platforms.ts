// IGDB Platforms
export const PLATFORMS = [
  {
    id: 6,
    abbreviation: "PC",
    name: "PC (Windows)",
    slug: "win",
    icon: "local:win",
  },
  {
    id: 48,
    abbreviation: "PS4",
    name: "PlayStation 4",
    slug: "ps4--1",
    icon: "local:ps",
  },
  {
    id: 167,
    abbreviation: "PS5",
    name: "PlayStation 5",
    slug: "ps5",
    icon: "local:ps",
  },
  {
    id: 169,
    abbreviation: "Series X|S",
    name: "Xbox Series X|S",
    slug: "series-x-s",
    icon: "local:xbox",
  },
  {
    id: 130,
    abbreviation: "Switch",
    name: "Nintendo Switch",
    slug: "switch",
    icon: "local:switch",
  },
];

export const SUPPORTED_PLATFORM_IDS = PLATFORMS.map(platform => platform.id);
