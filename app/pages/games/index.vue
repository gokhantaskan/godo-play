<script setup lang="ts">
import { refDebounced } from "@vueuse/core";

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

// Constants
// const DEFAULT_SORT = "aggregated_rating";
// const DEFAULT_SORT_ORDER = "desc" as const;
// const DEFAULT_LIMIT = 60;
const DEBOUNCE_DELAY = 500;

// Composables
const route = useRoute();
const router = useRouter();
const initialQuery = route.query as InitialQuery;

// Platform Selection Logic
const initialPlatforms = initialQuery.platforms?.split(",").map(Number);
const selectedPlatforms = reactive({
  p1: initialPlatforms?.[0] ?? PLATFORMS[0]!.id,
  p2: initialPlatforms?.[1] ?? null,
  p3: initialPlatforms?.[2] ?? null,
});

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
  excludeKeys: Array<keyof typeof selectedPlatforms>
): ((typeof PLATFORMS)[0] & { icon: string })[] {
  return PLATFORMS.filter(
    platform => !excludeKeys.some(key => platform.id === selectedPlatforms[key])
  ).map(platform => ({
    ...platform,
    icon: platform.icon || "lucide:gamepad-2",
  }));
}

const availablePlatforms = reactive({
  p1: computed(() => [...getPlatformOptions(["p2", "p3"])]),
  p2: computed(() => [
    { id: null, name: "Any Platform", icon: "lucide:gamepad-2" },
    ...getPlatformOptions(["p1", "p3"]),
  ]),
  p3: computed(() => [
    { id: null, name: "Any Platform", icon: "lucide:gamepad-2" },
    ...getPlatformOptions(["p1", "p2"]),
  ]),
});

// Filter Selections
const selectedFilters = reactive({
  gameModes: initialQuery.gameModes?.split(",").map(Number) || [],
  playerPerspectives:
    initialQuery.playerPerspectives?.split(",").map(Number) || [],
  genres: initialQuery.genres?.split(",").map(Number) || [],
  themes: initialQuery.themes?.split(",").map(Number) || [],
});

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

// Sort and Search
// const sortBy = ref<string>(DEFAULT_SORT);
// const sortOrder = ref<"asc" | "desc">(DEFAULT_SORT_ORDER);
const search = ref<string>(initialQuery.search?.toString() || "");
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
const requestBody = computed(() => ({
  platforms: [
    selectedPlatforms.p1,
    selectedPlatforms.p2,
    selectedPlatforms.p3,
  ].filter(Boolean),
  gameModes: selectedFilters.gameModes.length
    ? selectedFilters.gameModes
    : undefined,
  playerPerspectives: selectedFilters.playerPerspectives.length
    ? selectedFilters.playerPerspectives
    : undefined,
  genres: selectedFilters.genres.length ? selectedFilters.genres : undefined,
  themes: selectedFilters.themes.length ? selectedFilters.themes : undefined,
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

const {
  status,
  data: games,
  error: gamesError,
} = useFetch("/api/games", {
  method: "GET",
  query: queryParams,
});

const pending = computed(() => status.value === "pending");

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
</script>

<template>
  <main class="tw:container tw:space-y-4">
    <header class="tw:flex tw:justify-between tw:items-center tw:gap-4">
      <h1 class="title">Find the best co-op and multiplayer games</h1>
      <TheButton
        variant="secondary"
        size="sm"
        aria-label="Refresh"
        @click="clearQueryAndRefreshPage"
      >
        <Icon
          name="lucide:refresh-cw"
          class="tw:size-4"
        />
      </TheButton>
    </header>

    <section class="tw:flex tw:max-sm:flex-col tw:gap-4 tw:max-w-2xl">
      <TheSelect
        v-model="selectedPlatforms.p1"
        :options="availablePlatforms.p1"
        :icon="getPlatformIcon(selectedPlatforms.p1)"
        label="Platform 1"
        placeholder="Select platform"
        required
      />

      <TheSelect
        v-model="selectedPlatforms.p2"
        :options="availablePlatforms.p2"
        :icon="getPlatformIcon(selectedPlatforms.p2)"
        label="Platform 2"
        placeholder="Select platform"
      />

      <TheSelect
        v-model="selectedPlatforms.p3"
        :options="availablePlatforms.p3"
        :icon="getPlatformIcon(selectedPlatforms.p3)"
        label="Platform 3"
        placeholder="Select platform"
      />
    </section>

    <section>
      <SearchInput
        v-model="search"
        class="tw:max-sm:w-full tw:max-sm:mt-4"
        placeholder="Search by name"
      />
    </section>

    <section>
      <GameCategorySelector
        v-model:game-modes="selectedFilters.gameModes"
        v-model:player-perspectives="selectedFilters.playerPerspectives"
        v-model:genres="selectedFilters.genres"
        v-model:themes="selectedFilters.themes"
      />
    </section>

    <section
      v-if="pending"
      class="tw:flex tw:justify-center tw:items-center tw:min-h-[200px]"
    >
      <LoadingSpinner />
    </section>

    <section
      v-else-if="status === 'error'"
      class="tw:text-red"
    >
      Error fetching games: {{ gamesError }}
    </section>

    <section
      v-else-if="status === 'success' && !games?.length"
      class="tw:text-gray-600"
    >
      No games found for this combination
    </section>

    <section
      v-else-if="games"
      role="list"
      class="tw:grid tw:grid-cols-2 tw:gap-4 tw:sm:grid-cols-3 tw:lg:grid-cols-4 tw:xl:grid-cols-5"
    >
      <GameCard
        v-for="game in games"
        :key="game.id"
        :game="game"
      />
    </section>
  </main>
</template>

<style scoped lang="scss">
@use "sass:map";
@use "@/assets/styles/abstracts/variables" as *;

.title {
  font-size: 1.5rem;
  font-weight: 700;

  @media (min-width: map.get($breakpoints, "sm")) {
    font-size: 2.5rem;
  }
}
</style>
