// IGDB Platforms
export const SUPPORTED_PLATFORMS: {
  id: number;
  abbreviation: string;
  name: string;
  slug: string;
  icon: string;
}[] = [
  {
    id: 6,
    abbreviation: "PC",
    name: "PC (Windows)",
    slug: "win",
    icon: "platforms:win",
  },
  {
    id: 48,
    abbreviation: "PS4",
    name: "PlayStation 4",
    slug: "ps4--1",
    icon: "platforms:ps",
  },
  {
    id: 167,
    abbreviation: "PS5",
    name: "PlayStation 5",
    slug: "ps5",
    icon: "platforms:ps",
  },
  {
    id: 169,
    abbreviation: "Series X|S",
    name: "Xbox Series X|S",
    slug: "series-x-s",
    icon: "platforms:xbox",
  },
  {
    id: 130,
    abbreviation: "Switch",
    name: "Nintendo Switch",
    slug: "switch",
    icon: "platforms:switch",
  },
];

export const SUPPORTED_PLATFORM_IDS = SUPPORTED_PLATFORMS.map(
  platform => platform.id
);
