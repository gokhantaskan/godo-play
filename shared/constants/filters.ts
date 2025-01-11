export interface FilterOption {
  id: number;
  name: string;
  icon?: string;
}

export const GAME_MODES: FilterOption[] = [
  { id: 1, name: "Single Player" },
  { id: 2, name: "Multiplayer" },
  { id: 3, name: "Co-operative" },
  { id: 4, name: "Split Screen" },
  { id: 5, name: "MMO" },
  { id: 6, name: "Battle Royale" },
];

export const PLAYER_PERSPECTIVES: FilterOption[] = [
  { id: 1, name: "First Person" },
  { id: 2, name: "Third Person" },
  { id: 3, name: "Side View" },
  { id: 4, name: "Top Down" },
  { id: 5, name: "Isometric" },
  { id: 6, name: "Virtual Reality" },
];

export const GENRES: FilterOption[] = [
  { id: 1, name: "Action" },
  { id: 2, name: "Adventure" },
  { id: 3, name: "RPG" },
  { id: 4, name: "Strategy" },
  { id: 5, name: "Simulation" },
  { id: 6, name: "Sports" },
  { id: 7, name: "Racing" },
  { id: 8, name: "Shooter" },
  { id: 9, name: "Fighting" },
  { id: 10, name: "Platformer" },
  { id: 11, name: "Puzzle" },
  { id: 12, name: "Card & Board Game" },
  { id: 13, name: "Music & Rhythm" },
  { id: 14, name: "Visual Novel" },
  { id: 15, name: "MOBA" },
];

export const THEMES: FilterOption[] = [
  { id: 1, name: "Fantasy" },
  { id: 2, name: "Science Fiction" },
  { id: 3, name: "Horror" },
  { id: 4, name: "Mystery" },
  { id: 5, name: "Historical" },
  { id: 6, name: "Military" },
  { id: 7, name: "Stealth" },
  { id: 8, name: "Comedy" },
  { id: 9, name: "Western" },
  { id: 10, name: "Post-apocalyptic" },
  { id: 11, name: "Cyberpunk" },
  { id: 12, name: "Superhero" },
  { id: 13, name: "Survival" },
  { id: 14, name: "Open World" },
  { id: 15, name: "Sandbox" },
];
