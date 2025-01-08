import type { BaseEntity } from "~~/shared/types/igdb/globals";

export interface DashboardGame extends BaseEntity {
  category: number;
  websites: Website[];
  cover?: Cover;
  game_modes?: BaseEntity[];
  genres?: BaseEntity[];
  platforms?: Platform[];
  themes?: BaseEntity[];
  player_perspectives?: BaseEntity[];
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

export interface Website {
  id: number;
  category: number;
  game: number;
  trusted: boolean;
  url: string;
  checksum: string;
}

export interface Platform extends BaseEntity {
  abbreviation: string;
  alternative_name: string;
  category: number;
  platform_logo: number;
  versions: number[];
  websites: number[];
  generation?: number;
  platform_family?: number;
  summary?: string;
}
