interface SmallEntity {
  id: number;
  name: string;
}

export interface GameDetails {
  id: number;
  age_ratings: AgeRating[];
  category: number;
  cover: Image;
  first_release_date: number;
  game_modes: SmallEntity[];
  genres: SmallEntity[];
  multiplayer_modes?: MultiplayerMode[];
  name: string;
  platforms: SmallEntity[];
  player_perspectives?: SmallEntity[];
  involved_companies: InvolvedCompany[];
  screenshots: Image[];
  storyline: string;
  summary: string;
  themes: SmallEntity[];
  websites: Website[];
}

export interface AgeRating {
  id: number;
  category: number;
  content_descriptions?: number[];
  rating: number;
  synopsis?: string;
  checksum: string;
}

export interface MultiplayerMode {
  id: number;
  campaigncoop: boolean;
  dropin: boolean;
  game: number;
  lancoop: boolean;
  offlinecoop: boolean;
  offlinecoopmax: number;
  offlinemax: number;
  onlinecoop: boolean;
  onlinecoopmax: number;
  onlinemax: number;
  platform?: number;
  splitscreen: boolean;
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

export interface Image {
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

export interface InvolvedCompany {
  id: number;
  company: {
    id: number;
    name: string;
  };
  created_at: number;
  developer: boolean;
  game: number;
  porting: boolean;
  publisher: boolean;
  supporting: boolean;
  updated_at: number;
  checksum: string;
}
