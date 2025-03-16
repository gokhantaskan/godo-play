<script setup lang="ts">
import { refDebounced } from "@vueuse/core";

import type { PlatformId } from "~/types/crossPlay";
import { SUPPORTED_GAME_MODES, SUPPORTED_PLATFORMS } from "~~/shared/constants";
import type { GameSubmissionWithRelations } from "~~/shared/types";

interface InitialRouteQuery {
  platforms: string;
  stores: string;
  gameModes: string;
  search: string;
  sort: string;
  freeToPlay: string;
  [key: string]: string | string[];
}

type SupportedPlatform = (typeof SUPPORTED_PLATFORMS)[number];

interface SelectedPlatforms {
  p1: SupportedPlatform["id"] | null;
  p2: SupportedPlatform["id"] | null;
  p3: SupportedPlatform["id"] | null;
}

interface Filters {
  stores: number[];
  gameModes: number[];
  freeToPlay: boolean;
}

interface GamesResponse {
  total: number;
  data: GameSubmissionWithRelations[];
  limit: number;
  offset: number;
}

definePageMeta({
  name: "CrossPlayGamesPage",
});

useHead({
  link: [
    {
      rel: "canonical",
      href: "https://godo-play.com/games",
    },
  ],
});

const ITEMS_PER_PAGE = 48;

const route = useRoute();
const {
  platforms: initialQueryPlatforms,
  gameModes: initialQueryGameModes,
  search: initialQuerySearch,
  sort: initialQuerySort = "-popularity",
  freeToPlay: initialQueryFreeToPlay,
} = route.query as InitialRouteQuery;

// Platform Selection Management
const selectedPlatforms = ref<SelectedPlatforms>({
  p1: initialQueryPlatforms
    ? getPlatformIdBySlug(initialQueryPlatforms.split(",")[0] ?? "")
    : null,
  p2: initialQueryPlatforms
    ? getPlatformIdBySlug(initialQueryPlatforms.split(",")[1] ?? "")
    : null,
  p3: initialQueryPlatforms
    ? getPlatformIdBySlug(initialQueryPlatforms.split(",")[2] ?? "")
    : null,
});

const supportedModesMap = {
  idToSlug: SUPPORTED_GAME_MODES.reduce<Record<number, string>>((acc, curr) => {
    acc[curr.id] = curr.slug;
    return acc;
  }, {}),
  slugToId: SUPPORTED_GAME_MODES.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.slug] = curr.id;
    return acc;
  }, {}),
};

// Convert game mode slugs to IDs
function getGameModeIdFromSlug(slug: string): number | null {
  const gameMode = SUPPORTED_GAME_MODES.find(mode => mode.slug === slug);
  return gameMode ? gameMode.id : null;
}

// Initialize selectedFilters with game mode IDs from URL slugs
const selectedFilters = ref<Filters>({
  stores: [],
  gameModes: initialQueryGameModes
    ? initialQueryGameModes
        .split(",")
        .map(slug => getGameModeIdFromSlug(slug))
        .filter((id): id is number => id !== null)
    : [],
  freeToPlay: initialQueryFreeToPlay === "true",
});

const search = ref<string>(initialQuerySearch);
const debouncedSearch = refDebounced(search, 500);

// Add type safety for platform selection
function isPlatformId(value: unknown): value is PlatformId {
  return typeof value === "number" && !isNaN(value);
}

// Add sort state
const sort = ref<string>(initialQuerySort);

// Update urlQuery to include sort
const urlQuery = computed(() => {
  const platforms = [
    selectedPlatforms.value.p1,
    selectedPlatforms.value.p2,
    selectedPlatforms.value.p3,
  ]
    .filter(isPlatformId)
    .map(id => getPlatformSlugById(id));

  const queryToSet: Record<string, string> = {};

  if (platforms.length) {
    queryToSet.platforms = platforms.join(",");
  }

  if (selectedFilters.value.gameModes.length) {
    queryToSet.gameModes = selectedFilters.value.gameModes
      .map(id => supportedModesMap.idToSlug[id])
      .join(",");
  }

  if (selectedFilters.value.stores.length) {
    queryToSet.stores = selectedFilters.value.stores.join(",");
  }

  if (debouncedSearch.value) {
    queryToSet.search = debouncedSearch.value;
  }

  if (sort.value) {
    queryToSet.sort = sort.value;
  }

  if (selectedFilters.value.freeToPlay) {
    queryToSet.freeToPlay = "true";
  }

  return Object.keys(queryToSet).length ? queryToSet : undefined;
});

// Update apiQueryParams to include sort
const apiQueryParams = computed(() => {
  const platforms = [
    selectedPlatforms.value.p1,
    selectedPlatforms.value.p2,
    selectedPlatforms.value.p3,
  ].filter(isPlatformId);

  const query: Record<string, string> = {
    sort: sort.value,
  };

  if (platforms.length) {
    query.platforms = platforms.join(",");
  }

  if (selectedFilters.value.gameModes.length) {
    query.gameModes = selectedFilters.value.gameModes.join(",");
  }

  if (selectedFilters.value.stores.length) {
    query.stores = selectedFilters.value.stores.join(",");
  }

  if (debouncedSearch.value) {
    query.search = debouncedSearch.value;
  }

  if (selectedFilters.value.freeToPlay) {
    query.freeToPlay = "true";
  }

  return Object.keys(query).length ? query : undefined;
});

// Add pagination state
const currentOffset = ref<number>(0);
const totalGames = ref<number>(0);

// Track loading state for "Show More"
const isLoadingMore = ref(false);

const { data: gamesResponse, status } = await useFetch<GamesResponse>(
  "/api/public/games",
  {
    query: computed(() => ({
      ...apiQueryParams.value,
      limit: ITEMS_PER_PAGE,
      offset: currentOffset.value,
    })),
    watch: [apiQueryParams, currentOffset],
  }
);

const games = useCrossplayGames();

// Update games when response changes
watch(
  gamesResponse,
  newResponse => {
    if (newResponse?.data) {
      if (currentOffset.value === 0) {
        games.value = newResponse.data;
      } else {
        games.value = [...games.value, ...newResponse.data];
      }
      totalGames.value = newResponse.total;
      isLoadingMore.value = false;
    }
  },
  { immediate: true }
);

// Reset offset when filters change
watch(
  apiQueryParams,
  () => {
    currentOffset.value = 0;
  },
  { deep: true }
);

const hasMoreGames = computed(() => {
  if (!totalGames.value || !games.value) {
    return false;
  }
  return games.value.length < totalGames.value;
});

// Function to load more games
function loadMoreGames() {
  isLoadingMore.value = true;
  currentOffset.value += ITEMS_PER_PAGE;
}

const pending = computed(
  () => status.value === "pending" && currentOffset.value === 0
);

// Watch for changes in selected platforms and update URL
watch(
  urlQuery,
  newQuery => {
    useRouter().replace({
      query: newQuery,
    });
  },
  { deep: true }
);

useHead({
  title: computed(() => getMetaTitle()),
});

useSeoMeta({
  title: computed(() => `${getMetaTitle()} - GodoPlay`),
  ogTitle: computed(() => `${getMetaTitle()} - GodoPlay`),
  twitterTitle: computed(() => `${getMetaTitle()} - GodoPlay`),
  description:
    "Find the best cross-gen and cross-play games between PC, Mac, PlayStation, Xbox, and Nintendo Switch.",
  ogDescription:
    "Find the best cross-gen and cross-play games between PC, Mac, PlayStation, Xbox, and Nintendo Switch.",
  twitterDescription:
    "Find the best cross-gen and cross-play games between PC, Mac, PlayStation, Xbox, and Nintendo Switch.",
});

function getMetaTitle() {
  return Object.values(selectedPlatforms.value).some(Boolean)
    ? `Cross-Play Games (${Object.values(selectedPlatforms.value)
        .filter(Boolean)
        .map(p => SUPPORTED_PLATFORMS.find(platform => platform.id === p)?.name)
        .join(", ")})`
    : "All Cross-Play Games";
}

// Add function to clear filters and refresh page
function clearQueryAndRefreshPage() {
  if (import.meta.client) {
    const url = new URL(window.location.href);
    const baseUrl = `${url.origin}${url.pathname}`;

    window.location.href = `${baseUrl}?`;
  }
}

// Add function to remove individual filters
function removeFilter(chip: { type: string; id: number | string }) {
  switch (chip.type) {
    case "gameMode":
      selectedFilters.value.gameModes = selectedFilters.value.gameModes.filter(
        id => id !== chip.id
      );
      break;
    case "freeToPlay":
      selectedFilters.value.freeToPlay = false;
      break;
  }
}

// Add computed for active filter chips
const activeFilterChips = computed(() => {
  const chips: Array<{ type: string; id: number | string; name: string }> = [];

  selectedFilters.value.gameModes.forEach(id => {
    const mode = SUPPORTED_GAME_MODES.find(m => m.id === id);
    if (mode) {
      chips.push({ type: "gameMode", id, name: mode.name });
    }
  });

  if (selectedFilters.value.freeToPlay) {
    chips.push({ type: "freeToPlay", id: "freeToPlay", name: "Free to Play" });
  }

  return chips;
});

// Add sort change handler
function handleSortChange(value: string | string[] | undefined) {
  if (typeof value === "string") {
    sort.value = value;
  }
}
</script>

<template>
  <main class="tw:container tw:space-y-4">
    <header>
      <h1>Cross-Play Games</h1>
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

    <p class="tw:text-text-muted tw:text-sm">
      Discover the best cross-gen and cross-play games available across multiple
      platforms, including PC, Mac, PlayStation, Xbox, and Nintendo Switch.
    </p>

    <section class="tw:flex tw:max-sm:flex-col tw:gap-4 tw:max-w-2xl">
      <PlatformSelect
        v-model="selectedPlatforms.p1 as SupportedPlatform['id']"
        :exclude-platforms="
          [selectedPlatforms.p2, selectedPlatforms.p3].filter(
            (p): p is SupportedPlatform['id'] => p !== null
          )
        "
        allow-empty
        label="Platform 1"
      />

      <PlatformSelect
        v-model="selectedPlatforms.p2 as SupportedPlatform['id']"
        :exclude-platforms="
          [selectedPlatforms.p1, selectedPlatforms.p3].filter(
            (p): p is SupportedPlatform['id'] => p !== null
          )
        "
        allow-empty
        label="Platform 2"
      />

      <PlatformSelect
        v-model="selectedPlatforms.p3 as SupportedPlatform['id']"
        :exclude-platforms="
          [selectedPlatforms.p1, selectedPlatforms.p2].filter(
            (p): p is SupportedPlatform['id'] => p !== null
          )
        "
        allow-empty
        label="Platform 3"
      />
    </section>

    <section class="tw:space-y-2 tw:max-sm:mt-4">
      <div class="tw:flex tw:gap-4">
        <TheSearchInput
          v-model="search"
          class="tw:max-md:w-full"
          placeholder="Search by name"
        />
        <TheSelect
          v-model="sort"
          class="tw:max-w-24 tw:grow-0"
          :options="[
            { value: '-popularity', label: 'Most Popular' },
            { value: '-created_at', label: 'Newest' },
            { value: '-updated_at', label: 'Recently Updated' },
            { value: '-first_release_date', label: 'Latest Release' },
          ]"
          full-width
          placeholder="Sort by"
          @update:model-value="handleSortChange"
        />
        <GameCategorySelector
          v-model:game-modes="selectedFilters.gameModes"
          v-model:free-to-play="selectedFilters.freeToPlay"
          :include="['gameModes']"
        />
      </div>
      <div></div>
      <div
        v-if="activeFilterChips.length"
        class="tw:w-full tw:flex tw:flex-wrap tw:gap-2"
      >
        <TheChip
          v-for="chip in activeFilterChips"
          :key="`${chip.type}-${chip.id}`"
          :label="chip.name"
          :removable="true"
          @remove="removeFilter(chip)"
        />
      </div>
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
      An error occurred while fetching games. Please try again later. If the
      issue persists, please contact me via
      <a href="mailto:contact@godo-play.com">contact@godo-play.com</a>.
    </section>

    <section
      v-else-if="games?.length"
      class="tw:grid tw:grid-cols-2 tw:sm:grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] tw:gap-4"
    >
      <CrossPlayGameCard
        v-for="submission in games"
        :key="submission.id"
        :game="submission"
      />
    </section>

    <p v-else>No submissions found.</p>

    <div
      v-if="hasMoreGames"
      class="tw:flex tw:justify-center tw:py-4"
    >
      <TheButton
        variant="secondary"
        :disabled="isLoadingMore"
        @click="loadMoreGames"
      >
        <template v-if="isLoadingMore">
          <LoadingSpinner class="tw:size-4" />
          <span class="tw:ml-2">Loading...</span>
        </template>
        <template v-else> Show More Games </template>
      </TheButton>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use "sass:map";
@use "@/assets/styles/abstracts/variables" as *;

.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  h1 {
    font-size: 1.5rem;
    font-weight: 700;

    @media (min-width: map.get($breakpoints, "sm")) {
      font-size: 2.5rem;
    }
  }
}
</style>
