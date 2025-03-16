import {
  CROSSPLAY_FILTERS_STORAGE_KEY,
  CROSSPLAY_GAMES_STORAGE_KEY,
} from "~/constants";

export const useCrossplayGames = () =>
  useState<GameSubmissionWithRelations[]>(
    CROSSPLAY_GAMES_STORAGE_KEY,
    () => []
  );

export const useCrossplayFilters = () =>
  useState<any>(CROSSPLAY_FILTERS_STORAGE_KEY, () => {});
