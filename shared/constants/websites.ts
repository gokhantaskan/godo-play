export const WEBSITES: {
  [key: string]: {
    url: string[];
    icon: string;
    label: string;
    subdomains?:
      | {
          [key: string]: {
            subdomain: string;
            icon: string;
            label: string;
          };
        }
      | true;
  };
} = {
  twitch: {
    url: ["twitch.tv"],
    icon: "fa6-brands:twitch",
    label: "Twitch",
  },
  youtube: {
    url: ["youtube.com"],
    icon: "fa6-brands:youtube",
    label: "YouTube",
  },
  tiktok: {
    url: ["tiktok.com"],
    icon: "fa6-brands:tiktok",
    label: "TikTok",
  },
  instagram: {
    url: ["instagram.com"],
    icon: "fa6-brands:instagram",
    label: "Instagram",
  },
  twitter: {
    url: ["twitter.com", "x.com"],
    icon: "fa6-brands:x-twitter",
    label: "X (Formerly Twitter)",
  },
  reddit: {
    url: ["reddit.com"],
    icon: "fa6-brands:reddit",
    label: "Reddit",
  },
  discord: {
    url: ["discord.com", "discord.gg"],
    icon: "fa6-brands:discord",
    label: "Discord",
  },
  wikipedia: {
    url: ["wikipedia.org"],
    icon: "fa6-brands:wikipedia-w",
    label: "Wikipedia",
    subdomains: true,
  },
  steam: {
    url: ["steampowered.com", "store.steampowered.com"],
    icon: "fa6-brands:steam",
    label: "Steam",
  },
  facebook: {
    url: ["facebook.com"],
    icon: "fa6-brands:facebook",
    label: "Facebook",
  },
  epicgames: {
    url: ["epicgames.com", "store.epicgames.com"],
    icon: "lucide:globe",
    label: "Epic Games",
  },
  apple: {
    url: ["apple.com"],
    icon: "fa6-brands:apple",
    label: "Apple",
    subdomains: {
      itunes: {
        subdomain: "itunes",
        icon: "fa6-brands:apple",
        label: "iTunes",
      },
      appStore: {
        subdomain: "apps",
        icon: "fa6-brands:app-store",
        label: "App Store",
      },
    },
  },
  playStore: {
    url: ["play.google.com"],
    icon: "fa6-brands:google-play",
    label: "Google Play",
  },
  itch: {
    url: ["itch.io"],
    icon: "fa6-brands:itch-io",
    label: "Itch.io",
  },
  gog: {
    url: ["gog.com"],
    icon: "lucide:globe",
    label: "GOG",
  },
};
