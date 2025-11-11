import type { BaseEntity } from "./globals";

export interface DashboardGame {
  id: number;
  aggregated_rating: number;
  game_type: number; // 0: main game, 3: bundle, 8: remake, 9: remaster
  cover: Cover;
  first_release_date: number;
  game_modes: BaseEntity[];
  genres: BaseEntity[];
  multiplayer_modes?: MultiplayerMode[];
  name: string;
  platforms: Platform[];
  player_perspectives?: BaseEntity[];
  // release_dates: {
  //   id: number;
  //   date?: number;
  // }[];
  slug: string;
  themes?: BaseEntity[];
}

export interface Cover {
  id: number;
  alpha_channel: boolean;
  animated: boolean;
  game: number;
  height: number;
  image_id: string;
  url: string;
  width: number;
  checksum: string;
}

export interface MultiplayerMode {
  id: number;
  campaigncoop: boolean;
  dropin: boolean;
  game: number;
  lancoop: boolean;
  offlinecoop: boolean;
  offlinecoopmax?: number;
  onlinecoop: boolean;
  platform?: number;
  splitscreen: boolean;
  checksum: string;
  onlinecoopmax?: number;
  offlinemax?: number;
  onlinemax?: number;
}

export interface Platform extends BaseEntity {
  abbreviation: string;
  alternative_name?: string;
  category: number;
  generation?: number;
  platform_logo: number;
  platform_family?: number;
  versions: number[];
  websites?: number[];
  summary?: string;
}
