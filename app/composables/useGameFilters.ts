import { refDebounced } from "@vueuse/core";

import type { SelectOption } from "~/components/The/TheSelect.vue";
import {
  EXTERNAL_GAME_MODES,
  GENRES,
  PLAYER_PERSPECTIVES,
  SUPPORTED_PLATFORMS,
  THEMES,
} from "~~/shared/constants/";

// Platform option structure
interface PlatformOption extends SelectOption {
  value: number | null;
  label: string;
  icon: string;
}

// Query parameters structure from the URL
interface InitialQuery {
  gameModes?: string;
  playerPerspectives?: string;
  genres?: string;
  themes?: string;
  platforms?: string;
  search?: string;
}

// Structure for selected platform combinations
interface SelectedPlatforms {
  p1: number; // Primary platform (required)
  p2: number | null; // Optional second platform
  p3: number | null; // Optional third platform
}

// Structure for all filter categories
interface SelectedFilters {
  gameModes: number[];
  playerPerspectives: number[];
  genres: number[];
  themes: number[];
}

// Available platform options for each slot
interface AvailablePlatforms {
  p1: ComputedRef<PlatformOption[]>;
  p2: ComputedRef<PlatformOption[]>;
  p3: ComputedRef<PlatformOption[]>;
}

// Structure for API request body
interface RequestBody {
  platforms: number[];
  gameModes?: number[];
  playerPerspectives?: number[];
  genres?: number[];
  themes?: number[];
  search?: string;
}

// Structure for filter chips display
interface FilterChip {
  id: number;
  name: string;
  type: "gameMode" | "playerPerspective" | "genre" | "theme";
}

// Return type for the composable
interface GameFiltersReturn {
  // Platform Selection
  selectedPlatforms: Ref<SelectedPlatforms>;
  availablePlatforms: AvailablePlatforms;
  getPlatformIcon: (platformId: number | null) => string;

  // Filter Selections
  selectedFilters: Ref<SelectedFilters>;

  // Search
  search: Ref<string>;
  debouncedSearch: Ref<string>;

  // Data Fetching
  requestBody: ComputedRef<RequestBody>;
  queryParams: ComputedRef<Record<string, string>>;

  // Utils
  clearQueryAndRefreshPage: () => void;

  // Active Filters
  activeFilterChips: ComputedRef<FilterChip[]>;
  removeFilter: (chip: FilterChip) => void;
}

// Mapping functions for converting between IDs and slugs
const platformsMap = {
  idToSlug: SUPPORTED_PLATFORMS.reduce<Record<number, string>>((acc, curr) => {
    acc[curr.id] = curr.slug;
    return acc;
  }, {}),
  slugToId: SUPPORTED_PLATFORMS.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.slug] = curr.id;
    return acc;
  }, {}),
};

const gameModeMap = {
  idToSlug: EXTERNAL_GAME_MODES.reduce<Record<number, string>>((acc, curr) => {
    acc[curr.id] = curr.slug;
    return acc;
  }, {}),
  slugToId: EXTERNAL_GAME_MODES.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.slug] = curr.id;
    return acc;
  }, {}),
};

const playerPerspectivesMap = {
  idToSlug: PLAYER_PERSPECTIVES.reduce<Record<number, string>>((acc, curr) => {
    acc[curr.id] = curr.slug;
    return acc;
  }, {}),
  slugToId: PLAYER_PERSPECTIVES.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.slug] = curr.id;
    return acc;
  }, {}),
};

const genresMap = {
  idToSlug: GENRES.reduce<Record<number, string>>((acc, curr) => {
    acc[curr.id] = curr.slug;
    return acc;
  }, {}),
  slugToId: GENRES.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.slug] = curr.id;
    return acc;
  }, {}),
};

const themesMap = {
  idToSlug: THEMES.reduce<Record<number, string>>((acc, curr) => {
    acc[curr.id] = curr.slug;
    return acc;
  }, {}),
  slugToId: THEMES.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.slug] = curr.id;
    return acc;
  }, {}),
};

/**
 * Helper function to convert slug to ID
 */
function getIdFromSlug(
  slug: string,
  map: Record<string, number>
): number | null {
  return map[slug] ?? null;
}

/**
 * Helper function to convert ID to slug
 */
function getSlugFromId(id: number, map: Record<number, string>): string | null {
  return map[id] ?? null;
}

/**
 * Composable for managing game filters state and functionality
 * Handles platform selection, filter categories, search, and URL synchronization
 */
export function useGameFilters(): GameFiltersReturn {
  const DEBOUNCE_DELAY = 500;

  // Initialize route and router for URL management
  const route = useRoute();
  const router = useRouter();
  const initialQuery = route.query as InitialQuery;

  /**
   * Platform Selection Management
   * - Initializes from URL query or defaults to first platform
   */
  const initialPlatforms = initialQuery.platforms
    ?.split(",")
    .map(slug => getIdFromSlug(slug, platformsMap.slugToId));
  const selectedPlatforms = ref<SelectedPlatforms>({
    p1: initialPlatforms?.[0] ?? SUPPORTED_PLATFORMS[0]!.id,
    p2: initialPlatforms?.[1] ?? null,
    p3: initialPlatforms?.[2] ?? null,
  });

  /**
   * Gets available platform options excluding already selected ones
   * Used to prevent selecting the same platform multiple times
   */
  function getPlatformOptions(
    excludeKeys: Array<keyof typeof selectedPlatforms.value>
  ): PlatformOption[] {
    return SUPPORTED_PLATFORMS.filter(
      platform =>
        !excludeKeys.some(key => platform.id === selectedPlatforms.value[key])
    ).map(platform => ({
      value: platform.id,
      label: platform.name,
      icon: platform.icon || "lucide:gamepad-2",
    }));
  }

  /**
   * Computed platform options for each slot
   * - P1: All platforms except those selected in P2 and P3
   * - P2/P3: All platforms except those selected in other slots, plus "Any Platform" option
   */
  const availablePlatforms: AvailablePlatforms = {
    p1: computed(() => [...getPlatformOptions(["p2", "p3"])]),
    p2: computed(() => [
      { value: null, label: "Any Platform", icon: "lucide:gamepad-2" },
      ...getPlatformOptions(["p1", "p3"]),
    ]),
    p3: computed(() => [
      { value: null, label: "Any Platform", icon: "lucide:gamepad-2" },
      ...getPlatformOptions(["p1", "p2"]),
    ]),
  };

  /**
   * Filter Categories Management
   * - Initializes from URL query using slugs
   */
  const selectedFilters = ref<SelectedFilters>({
    gameModes:
      initialQuery.gameModes
        ?.split(",")
        .map(slug => getIdFromSlug(slug, gameModeMap.slugToId))
        .filter((id): id is number => id !== null) || [],
    playerPerspectives:
      initialQuery.playerPerspectives
        ?.split(",")
        .map(slug => getIdFromSlug(slug, playerPerspectivesMap.slugToId))
        .filter((id): id is number => id !== null) || [],
    genres:
      initialQuery.genres
        ?.split(",")
        .map(slug => getIdFromSlug(slug, genresMap.slugToId))
        .filter((id): id is number => id !== null) || [],
    themes:
      initialQuery.themes
        ?.split(",")
        .map(slug => getIdFromSlug(slug, themesMap.slugToId))
        .filter((id): id is number => id !== null) || [],
  });

  /**
   * Search Management
   * - Uses debounced input to prevent excessive API calls
   */
  const search = ref<string>(initialQuery.search?.toString() || "");
  const debouncedSearch = refDebounced<string>(search, DEBOUNCE_DELAY);

  /**
   * Updates URL query parameters while preserving unrelated parameters
   */
  function updateQueryParams(
    params: Partial<Record<string, string | undefined>>
  ) {
    router.replace({
      query: {
        ...route.query,
        ...params,
      },
    });
  }

  /**
   * Watches all filter states and syncs with URL using slugs
   * - Runs immediately on mount to sync URL with persisted state
   * - Deep watches objects to catch nested changes
   */
  watch(
    [selectedPlatforms, selectedFilters, search],
    ([platforms, filters, searchValue]) => {
      const platformsList = [platforms.p1, platforms.p2, platforms.p3]
        .filter((id): id is number => id !== null)
        .map(id => getSlugFromId(id, platformsMap.idToSlug))
        .filter(Boolean)
        .join(",");

      updateQueryParams({
        platforms: platformsList || undefined,
        gameModes: filters.gameModes.length
          ? filters.gameModes
              .map(id => getSlugFromId(id, gameModeMap.idToSlug))
              .filter(Boolean)
              .join(",")
          : undefined,
        playerPerspectives: filters.playerPerspectives.length
          ? filters.playerPerspectives
              .map(id => getSlugFromId(id, playerPerspectivesMap.idToSlug))
              .filter(Boolean)
              .join(",")
          : undefined,
        genres: filters.genres.length
          ? filters.genres
              .map(id => getSlugFromId(id, genresMap.idToSlug))
              .filter(Boolean)
              .join(",")
          : undefined,
        themes: filters.themes.length
          ? filters.themes
              .map(id => getSlugFromId(id, themesMap.idToSlug))
              .filter(Boolean)
              .join(",")
          : undefined,
        search: searchValue || undefined,
      });
    },
    { immediate: true, deep: true }
  );

  /**
   * Prepares request body for API calls
   * - Filters out empty arrays and undefined values
   * - Formats data according to API requirements
   */
  const requestBody = computed<RequestBody>(() => ({
    platforms: [
      selectedPlatforms.value.p1,
      selectedPlatforms.value.p2,
      selectedPlatforms.value.p3,
    ].filter(Boolean) as number[],
    gameModes: selectedFilters.value.gameModes.length
      ? selectedFilters.value.gameModes
      : undefined,
    playerPerspectives: selectedFilters.value.playerPerspectives.length
      ? selectedFilters.value.playerPerspectives
      : undefined,
    genres: selectedFilters.value.genres.length
      ? selectedFilters.value.genres
      : undefined,
    themes: selectedFilters.value.themes.length
      ? selectedFilters.value.themes
      : undefined,
    search: debouncedSearch.value || undefined,
  }));

  /**
   * Formats query parameters for API requests
   * - Uses IDs for API communication
   */
  const queryParams = computed(() => {
    const params: Record<string, string> = {};

    const platforms = [
      selectedPlatforms.value.p1,
      selectedPlatforms.value.p2,
      selectedPlatforms.value.p3,
    ].filter((id): id is number => id !== null);

    if (platforms.length) {
      params.platforms = platforms.join(",");
    }

    if (selectedFilters.value.gameModes.length) {
      params.gameModes = selectedFilters.value.gameModes.join(",");
    }

    if (selectedFilters.value.playerPerspectives.length) {
      params.playerPerspectives =
        selectedFilters.value.playerPerspectives.join(",");
    }

    if (selectedFilters.value.genres.length) {
      params.genres = selectedFilters.value.genres.join(",");
    }

    if (selectedFilters.value.themes.length) {
      params.themes = selectedFilters.value.themes.join(",");
    }

    if (debouncedSearch.value) {
      params.search = debouncedSearch.value;
    }

    return params;
  });

  /**
   * Utility function to clear all filters and refresh the page
   */
  function clearQueryAndRefreshPage() {
    if (import.meta.client) {
      const url = new URL(window.location.href);
      const baseUrl = `${url.origin}${url.pathname}`;

      window.location.href = `${baseUrl}?`;
    }
  }

  /**
   * Gets the platform icon for a given platform ID
   */
  function getPlatformIcon(platformId: number | null): string {
    const platform = SUPPORTED_PLATFORMS.find(p => p.id === platformId);
    return platform?.icon ?? "lucide:gamepad-2";
  }

  /**
   * Computes active filter chips for display
   */
  const activeFilterChips = computed<FilterChip[]>(() => {
    const chips: FilterChip[] = [];

    selectedFilters.value.gameModes.forEach(id => {
      const mode = EXTERNAL_GAME_MODES.find(m => m.id === id);
      if (mode) {
        chips.push({ type: "gameMode", id, name: mode.name });
      }
    });

    selectedFilters.value.playerPerspectives.forEach(id => {
      const perspective = PLAYER_PERSPECTIVES.find(p => p.id === id);
      if (perspective) {
        chips.push({
          type: "playerPerspective",
          id,
          name: perspective.name,
        });
      }
    });

    selectedFilters.value.genres.forEach(id => {
      const genre = GENRES.find(g => g.id === id);
      if (genre) {
        chips.push({ type: "genre", id, name: genre.name });
      }
    });

    selectedFilters.value.themes.forEach(id => {
      const theme = THEMES.find(t => t.id === id);
      if (theme) {
        chips.push({ type: "theme", id, name: theme.name });
      }
    });

    return chips;
  });

  /**
   * Removes a filter chip
   */
  function removeFilter(chip: FilterChip) {
    switch (chip.type) {
      case "gameMode":
        selectedFilters.value.gameModes =
          selectedFilters.value.gameModes.filter(id => id !== chip.id);
        break;
      case "playerPerspective":
        selectedFilters.value.playerPerspectives =
          selectedFilters.value.playerPerspectives.filter(id => id !== chip.id);
        break;
      case "genre":
        selectedFilters.value.genres = selectedFilters.value.genres.filter(
          id => id !== chip.id
        );
        break;
      case "theme":
        selectedFilters.value.themes = selectedFilters.value.themes.filter(
          id => id !== chip.id
        );
        break;
    }
  }

  return {
    selectedPlatforms,
    availablePlatforms,
    getPlatformIcon,
    selectedFilters,
    search,
    debouncedSearch,
    requestBody,
    queryParams,
    clearQueryAndRefreshPage,
    activeFilterChips,
    removeFilter,
  } satisfies GameFiltersReturn;
}
