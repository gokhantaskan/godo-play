import { refDebounced } from "@vueuse/core";

import {
  GAME_MODES,
  GENRES,
  PLAYER_PERSPECTIVES,
  SUPPORTED_PLATFORMS,
  THEMES,
} from "~~/shared/constants/";

/**
 * Types for the game filters functionality
 */

// Filter option structure
interface FilterOption {
  id: number;
  name: string;
  icon?: string;
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

// Platform option structure with icon support
interface Platform {
  id: number | null;
  name: string;
  icon: string;
  [key: string]: any; // For compatibility with TheSelect component
}

// Available platform options for each slot
interface AvailablePlatforms {
  p1: ComputedRef<Platform[]>;
  p2: ComputedRef<Platform[]>;
  p3: ComputedRef<Platform[]>;
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
  selectedPlatforms: SelectedPlatforms;
  availablePlatforms: AvailablePlatforms;
  getPlatformIcon: (platformId: number | null) => string;

  // Filter Selections
  selectedFilters: SelectedFilters;

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
   * - Maintains state across navigation using useState
   */
  const initialPlatforms = initialQuery.platforms?.split(",").map(Number);
  const selectedPlatforms = useState<SelectedPlatforms>(
    "game-platforms",
    () => ({
      p1: initialPlatforms?.[0] ?? SUPPORTED_PLATFORMS[0]!.id,
      p2: initialPlatforms?.[1] ?? null,
      p3: initialPlatforms?.[2] ?? null,
    })
  );

  /**
   * Gets available platform options excluding already selected ones
   * Used to prevent selecting the same platform multiple times
   */
  function getPlatformOptions(
    excludeKeys: Array<keyof typeof selectedPlatforms.value>
  ): Platform[] {
    return SUPPORTED_PLATFORMS.filter(
      platform =>
        !excludeKeys.some(key => platform.id === selectedPlatforms.value[key])
    ).map(platform => ({
      ...platform,
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
      { id: null, name: "Any Platform", icon: "lucide:gamepad-2" },
      ...getPlatformOptions(["p1", "p3"]),
    ]),
    p3: computed(() => [
      { id: null, name: "Any Platform", icon: "lucide:gamepad-2" },
      ...getPlatformOptions(["p1", "p2"]),
    ]),
  };

  /**
   * Filter Categories Management
   * - Initializes from URL query
   * - Maintains state across navigation using useState
   */
  const selectedFilters = useState<SelectedFilters>("game-filters", () => ({
    gameModes: initialQuery.gameModes?.split(",").map(Number) || [],
    playerPerspectives:
      initialQuery.playerPerspectives?.split(",").map(Number) || [],
    genres: initialQuery.genres?.split(",").map(Number) || [],
    themes: initialQuery.themes?.split(",").map(Number) || [],
  }));

  /**
   * Search Management
   * - Uses debounced input to prevent excessive API calls
   * - Maintains state across navigation using useState
   */
  const search = useState<string>(
    "game-search",
    () => initialQuery.search?.toString() || ""
  );
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
   * Watches all filter states and syncs with URL
   * - Runs immediately on mount to sync URL with persisted state
   * - Deep watches objects to catch nested changes
   */
  watch(
    [selectedPlatforms, selectedFilters, search],
    ([platforms, filters, searchValue]) => {
      const platformsList = [platforms.p1, platforms.p2, platforms.p3]
        .filter(Boolean)
        .join(",");

      updateQueryParams({
        platforms: platformsList || undefined,
        gameModes: filters.gameModes.length
          ? filters.gameModes.join(",")
          : undefined,
        playerPerspectives: filters.playerPerspectives.length
          ? filters.playerPerspectives.join(",")
          : undefined,
        genres: filters.genres.length ? filters.genres.join(",") : undefined,
        themes: filters.themes.length ? filters.themes.join(",") : undefined,
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
   * - Encodes values for URL safety
   * - Joins arrays with commas
   */
  const queryParams = computed(() => {
    return Object.fromEntries(
      Object.entries(requestBody.value)
        .filter(([_, value]) => Boolean(value))
        .map(([key, value]) => [
          key,
          encodeURIComponent(
            String(Array.isArray(value) ? value.join(",") : value)
          ),
        ])
    );
  });

  /**
   * Utility to clear all filters and refresh the page
   * Only works on client-side
   */
  function clearQueryAndRefreshPage() {
    if (import.meta.client) {
      const url = new URL(window.location.href);
      const baseUrl = `${url.origin}${url.pathname}`;

      window.location.href = `${baseUrl}?`;
    }
  }

  /**
   * Gets the platform icon for display
   * Falls back to default gamepad icon if not found
   */
  function getPlatformIcon(platformId: number | null): string {
    if (!platformId) return "lucide:gamepad-2";

    const platform = SUPPORTED_PLATFORMS.find(p => p.id === platformId);
    return platform?.icon || "lucide:gamepad-2";
  }

  /**
   * Active Filter Chips Management
   * - Converts selected filter IDs to displayable chips
   * - Groups by filter type for organized display
   */
  const activeFilterChips = computed<FilterChip[]>(() => {
    const chips: FilterChip[] = [];

    // Game Modes
    selectedFilters.value.gameModes.forEach(id => {
      const mode = GAME_MODES.find((m: FilterOption) => m.id === id);
      if (mode) {
        chips.push({
          id,
          name: mode.name,
          type: "gameMode",
        });
      }
    });

    // Player Perspectives
    selectedFilters.value.playerPerspectives.forEach(id => {
      const perspective = PLAYER_PERSPECTIVES.find(
        (p: FilterOption) => p.id === id
      );
      if (perspective) {
        chips.push({
          id,
          name: perspective.name,
          type: "playerPerspective",
        });
      }
    });

    // Genres
    selectedFilters.value.genres.forEach(id => {
      const genre = GENRES.find((g: FilterOption) => g.id === id);
      if (genre) {
        chips.push({
          id,
          name: genre.name,
          type: "genre",
        });
      }
    });

    // Themes
    selectedFilters.value.themes.forEach(id => {
      const theme = THEMES.find((t: FilterOption) => t.id === id);
      if (theme) {
        chips.push({
          id,
          name: theme.name,
          type: "theme",
        });
      }
    });

    return chips;
  });

  /**
   * Removes a filter when its chip is closed
   * Updates the appropriate filter array based on the chip type
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

  // Return all necessary values and functions
  return {
    // Platform Selection
    selectedPlatforms: selectedPlatforms.value,
    availablePlatforms,
    getPlatformIcon,

    // Filter Selections
    selectedFilters: selectedFilters.value,

    // Search
    search,
    debouncedSearch,

    // Data Fetching
    requestBody,
    queryParams,

    // Utils
    clearQueryAndRefreshPage,

    // Active Filters
    activeFilterChips,
    removeFilter,
  };
}
