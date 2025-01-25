import type { PlatformHardcoded } from "~~/shared/types/globals";

// IGDB Platforms
export const SUPPORTED_PLATFORMS: PlatformHardcoded[] = [
  {
    id: 6,
    name: "PC (Win)",
    slug: "win",
    icon: "platforms:win",
    abbreviation: "PC",
  },
  {
    id: 14,
    name: "MacOS",
    slug: "mac",
    icon: "platforms:mac",
    abbreviation: "Mac",
  },
  {
    id: 48,
    name: "PlayStation 4",
    slug: "ps4--1",
    icon: "platforms:ps4",
    abbreviation: "PS4",
  },
  {
    id: 167,
    name: "PlayStation 5",
    slug: "ps5",
    icon: "platforms:ps5",
    abbreviation: "PS5",
  },
  {
    id: 49,
    name: "Xbox One",
    slug: "xboxone",
    icon: "platforms:xboxone",
    abbreviation: "XONE",
  },
  {
    id: 169,
    name: "Xbox Series X|S",
    slug: "series-x-s",
    icon: "platforms:series-x-s",
    abbreviation: "XSX",
  },
  {
    id: 130,
    name: "Nintendo Switch",
    slug: "switch",
    icon: "platforms:switch",
    abbreviation: "Switch",
  },
];

export const SUPPORTED_PLATFORMS_BY_ID = SUPPORTED_PLATFORMS.reduce(
  (acc, platform) => {
    acc[platform.id] = platform;
    return acc;
  },
  {} as Record<PlatformHardcoded["id"], PlatformHardcoded>
);

export const supportedPlatformsMap: {
  idToSlug: Record<PlatformHardcoded["id"], PlatformHardcoded["slug"]>;
  slugToId: Record<PlatformHardcoded["slug"], PlatformHardcoded["id"]>;
} = {
  idToSlug: {},
  slugToId: {},
};

SUPPORTED_PLATFORMS.forEach(platform => {
  supportedPlatformsMap.idToSlug[platform.id] = platform.slug;
  supportedPlatformsMap.slugToId[platform.slug] = platform.id;
});

export const PLATFORM_ICONS = SUPPORTED_PLATFORMS.reduce(
  (acc, platform) => {
    acc[platform.slug] =
      `platforms:${platform.slug === "ps4--1" ? "ps4" : platform.slug}`;
    return acc;
  },
  {
    ps: "platforms:ps",
    xbox: "platforms:xbox",
  } as Record<PlatformHardcoded["slug"], string>
);

export const SUPPORTED_PLATFORM_IDS: PlatformHardcoded["id"][] =
  SUPPORTED_PLATFORMS.map(platform => platform.id);
