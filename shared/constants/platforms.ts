// IGDB Platforms
export const SUPPORTED_PLATFORMS = [
  {
    id: 6,
    name: "PC (Windows)",
    slug: "win",
    icon: "platforms:win",
  },
  {
    id: 14,
    name: "MacOS",
    slug: "mac",
    icon: "platforms:mac",
  },
  {
    id: 48,
    name: "PlayStation 4",
    slug: "ps4--1",
    icon: "platforms:ps",
  },
  {
    id: 167,
    name: "PlayStation 5",
    slug: "ps5",
    icon: "platforms:ps",
  },
  {
    id: 49,
    name: "Xbox One",
    slug: "xboxone",
    icon: "platforms:xbox",
  },
  {
    id: 169,
    name: "Xbox Series X|S",
    slug: "series-x-s",
    icon: "platforms:xbox",
  },
  {
    id: 130,
    name: "Nintendo Switch",
    slug: "switch",
    icon: "platforms:switch",
  },
] as const;

export const SUPPORTED_PLATFORM_IDS = SUPPORTED_PLATFORMS.map(
  platform => platform.id
);
