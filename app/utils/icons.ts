export const PLATFORM_ICONS = {
  win: "local:win",
  mac: "local:win",
  "ps4--1": "local:ps4",
  ps5: "local:ps5",
  "series-x-s": "local:xbox",
  switch: "local:switch",
  xboxone: "local:xbox",
};

export const getPlatformIcon = (slug: string) => {
  return PLATFORM_ICONS[slug as keyof typeof PLATFORM_ICONS];
};
