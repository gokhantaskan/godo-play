export const SUPPORTED_GAME_TYPES: {
  [key: number]: {
    label: string;
    slug: string;
    icon: string;
  };
} = {
  0: {
    label: "Main Game",
    slug: "main_game",
    icon: "lucide:gamepad",
  },
  3: {
    label: "Bundle",
    icon: "lucide:combine",
    slug: "bundle",
  },
  8: {
    label: "Remake",
    icon: "lucide:refresh-cw",
    slug: "remake",
  },
  9: {
    label: "Remaster",
    icon: "lucide:refresh-cw",
    slug: "remaster",
  },
  10: {
    label: "Expanded Game",
    icon: "lucide:expand",
    slug: "expanded_game",
  },
};
