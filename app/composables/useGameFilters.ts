import { refDebounced } from "@vueuse/core";

import {
  type FilterOption,
  GAME_MODES,
  GENRES,
  PLAYER_PERSPECTIVES,
  THEMES,
} from "~~/shared/constants/filters";
import { PLATFORMS } from "~~/shared/constants/platforms";

// Types
interface InitialQuery {
  gameModes?: string;
  playerPerspectives?: string;
  genres?: string;
  themes?: string;
  platforms?: string;
  search?: string;
}

interface SelectedPlatforms {
  p1: number;
  p2: number | null;
  p3: number | null;
}

interface SelectedFilters {
  gameModes: number[];
  playerPerspectives: number[];
  genres: number[];
  themes: number[];
}

interface Platform {
  id: number | null;
  name: string;
  icon: string;
  [key: string]: any; // Allow additional properties
}

interface AvailablePlatforms {
  p1: ComputedRef<Platform[]>;
  p2: ComputedRef<Platform[]>;
  p3: ComputedRef<Platform[]>;
}

interface RequestBody {
  platforms: number[];
  gameModes?: number[];
  playerPerspectives?: number[];
  genres?: number[];
  themes?: number[];
  search?: string;
}

interface FilterChip {
  id: number;
  name: string;
  type: "gameMode" | "playerPerspective" | "genre" | "theme";
}

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

export function useGameFilters(): GameFiltersReturn {
  const DEBOUNCE_DELAY = 500;

  // Route and Router
  const route = useRoute();
  const router = useRouter();
  const initialQuery = route.query as InitialQuery;

  // Platform Selection Logic
  const initialPlatforms = initialQuery.platforms?.split(",").map(Number);
  const selectedPlatforms = useState<SelectedPlatforms>(
    "game-platforms",
    () => ({
      p1: initialPlatforms?.[0] ?? PLATFORMS[0]!.id,
      p2: initialPlatforms?.[1] ?? null,
      p3: initialPlatforms?.[2] ?? null,
    })
  );

  // Watch for platform changes and update URL
  watch(
    selectedPlatforms,
    newPlatforms => {
      const platforms = [newPlatforms.p1, newPlatforms.p2, newPlatforms.p3]
        .filter(Boolean)
        .join(",");

      updateQueryParams({
        platforms: platforms || undefined,
      });
    },
    { deep: true }
  );

  function getPlatformOptions(
    excludeKeys: Array<keyof typeof selectedPlatforms.value>
  ): Platform[] {
    return PLATFORMS.filter(
      platform =>
        !excludeKeys.some(key => platform.id === selectedPlatforms.value[key])
    ).map(platform => ({
      ...platform,
      icon: platform.icon || "lucide:gamepad-2",
    }));
  }

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

  // Filter Selections
  const selectedFilters = useState<SelectedFilters>("game-filters", () => ({
    gameModes: initialQuery.gameModes?.split(",").map(Number) || [],
    playerPerspectives:
      initialQuery.playerPerspectives?.split(",").map(Number) || [],
    genres: initialQuery.genres?.split(",").map(Number) || [],
    themes: initialQuery.themes?.split(",").map(Number) || [],
  }));

  // Watch for filter changes and update URL
  watch(
    selectedFilters,
    newFilters => {
      updateQueryParams({
        gameModes: newFilters.gameModes.length
          ? newFilters.gameModes.join(",")
          : undefined,
        playerPerspectives: newFilters.playerPerspectives.length
          ? newFilters.playerPerspectives.join(",")
          : undefined,
        genres: newFilters.genres.length
          ? newFilters.genres.join(",")
          : undefined,
        themes: newFilters.themes.length
          ? newFilters.themes.join(",")
          : undefined,
      });
    },
    { deep: true }
  );

  // Search
  const search = useState<string>(
    "game-search",
    () => initialQuery.search?.toString() || ""
  );
  const debouncedSearch = refDebounced<string>(search, DEBOUNCE_DELAY);

  // URL Updates
  watch(debouncedSearch, newValue => {
    updateQueryParams({ search: newValue || undefined });
  });

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

  // Data Fetching
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

  function clearQueryAndRefreshPage() {
    if (import.meta.client) {
      const url = new URL(window.location.href);
      const baseUrl = `${url.origin}${url.pathname}`;

      window.location.href = `${baseUrl}?`;
    }
  }

  function getPlatformIcon(platformId: number | null): string {
    if (!platformId) return "lucide:gamepad-2";

    const platform = PLATFORMS.find(p => p.id === platformId);
    return platform?.icon || "lucide:gamepad-2";
  }

  // Active Filters
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
