import type { PlatformHardcoded } from "~~/shared/types/globals";

// IGDB Platforms
export const SUPPORTED_PLATFORMS: PlatformHardcoded[] = [
  {
    id: 6,
    name: "PC",
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
    name: "Xbox Series S|X",
    slug: "series-x-s",
    icon: "platforms:xbox",
  },
  {
    id: 130,
    name: "Nintendo Switch",
    slug: "switch",
    icon: "platforms:switch",
  },
];

export const SUPPORTED_PLATFORM_IDS: PlatformHardcoded["id"][] =
  SUPPORTED_PLATFORMS.map(platform => platform.id);
