<script setup lang="ts">
import { refDebounced } from "@vueuse/core";

import type { PlatformId } from "~/types/crossPlay";
import { GAME_MODES, SUPPORTED_PLATFORMS } from "~~/shared/constants";
import type { GameSubmissionWithRelations } from "~~/shared/types";

type SupportedPlatform = (typeof SUPPORTED_PLATFORMS)[number];

interface SelectedPlatforms {
  p1: SupportedPlatform["id"] | null;
  p2: SupportedPlatform["id"] | null;
  p3: SupportedPlatform["id"] | null;
}

interface Filters {
  pcStores: number[];
  gameModes: number[];
  playerPerspectives: number[];
  genres: number[];
  themes: number[];
}

definePageMeta({
  name: "CrossPlayGamesPage",
});

const route = useRoute();
const urlQueryParams = computed(() => {
  const {
    platforms,
    pcStores,
    gameModes,
    search,
    playerPerspectives,
    genres,
    themes,
  } = route.query;

  return {
    platforms: platforms as string,
    pcStores: pcStores as string,
    gameModes: gameModes as string,
    search: search as string,
    playerPerspectives: playerPerspectives as string,
    genres: genres as string,
    themes: themes as string,
  };
});

// Platform Selection Management
const selectedPlatforms = useState<SelectedPlatforms>(
  "crossplay-platforms",
  () => ({
    p1: urlQueryParams.value.platforms
      ? getPlatformIdBySlug(urlQueryParams.value.platforms.split(",")[0] ?? "")
      : null,
    p2: urlQueryParams.value.platforms
      ? getPlatformIdBySlug(urlQueryParams.value.platforms.split(",")[1] ?? "")
      : null,
    p3: urlQueryParams.value.platforms
      ? getPlatformIdBySlug(urlQueryParams.value.platforms.split(",")[2] ?? "")
      : null,
  })
);

const supportedModesMap = {
  idToSlug: GAME_MODES.reduce<Record<number, string>>((acc, curr) => {
    acc[curr.id] = curr.slug;
    return acc;
  }, {}),
  slugToId: GAME_MODES.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.slug] = curr.id;
    return acc;
  }, {}),
};

// Convert game mode slugs to IDs
function getGameModeIdFromSlug(slug: string): number | null {
  const gameMode = GAME_MODES.find(mode => mode.slug === slug);
  return gameMode ? gameMode.id : null;
}

// Initialize selectedFilters with game mode IDs from URL slugs
const selectedFilters = useState<Filters>("crossplay-filters", () => ({
  pcStores: [],
  gameModes: urlQueryParams.value.gameModes
    ? urlQueryParams.value.gameModes
        .split(",")
        .map(slug => getGameModeIdFromSlug(slug))
        .filter((id): id is number => id !== null)
    : [],
  playerPerspectives: urlQueryParams.value.playerPerspectives
    ? urlQueryParams.value.playerPerspectives.split(",").map(Number)
    : [],
  genres: urlQueryParams.value.genres
    ? urlQueryParams.value.genres.split(",").map(Number)
    : [],
  themes: urlQueryParams.value.themes
    ? urlQueryParams.value.themes.split(",").map(Number)
    : [],
}));

const search = useState<string>(
  "crossplay-search",
  () => urlQueryParams.value.search
);

const debouncedSearch = refDebounced(search, 500);

// Add type safety for platform selection
function isPlatformId(value: unknown): value is PlatformId {
  return typeof value === "number" && !isNaN(value);
}

// Update urlQuery to use game mode slugs
const urlQuery = computed(() => {
  const platforms = [
    selectedPlatforms.value.p1,
    selectedPlatforms.value.p2,
    selectedPlatforms.value.p3,
  ]
    .filter(isPlatformId)
    .map(id => getPlatformSlugById(id));

  const query: Record<string, string> = {};

  if (platforms.length) {
    query.platforms = platforms.join(",");
  }

  if (selectedFilters.value.gameModes.length) {
    query.gameModes = selectedFilters.value.gameModes
      .map(id => supportedModesMap.idToSlug[id])
      .join(",");
  }

  if (selectedFilters.value.pcStores.length) {
    query.pcStores = selectedFilters.value.pcStores.join(",");
  }

  if (selectedFilters.value.playerPerspectives.length) {
    query.playerPerspectives =
      selectedFilters.value.playerPerspectives.join(",");
  }

  if (selectedFilters.value.genres.length) {
    query.genres = selectedFilters.value.genres.join(",");
  }

  if (selectedFilters.value.themes.length) {
    query.themes = selectedFilters.value.themes.join(",");
  }

  if (debouncedSearch.value) {
    query.search = debouncedSearch.value;
  }

  return Object.keys(query).length ? query : undefined;
});

// Create a computed property for the API query
const apiQueryParams = computed(() => {
  const platforms = [
    selectedPlatforms.value.p1,
    selectedPlatforms.value.p2,
    selectedPlatforms.value.p3,
  ].filter(isPlatformId);

  const query: Record<string, string> = {};

  if (platforms.length) {
    query.platforms = platforms.join(",");
  }

  if (selectedFilters.value.gameModes.length) {
    query.gameModes = selectedFilters.value.gameModes.join(",");
  }

  if (selectedFilters.value.pcStores.length) {
    query.pcStores = selectedFilters.value.pcStores.join(",");
  }

  if (selectedFilters.value.playerPerspectives.length) {
    query.playerPerspectives =
      selectedFilters.value.playerPerspectives.join(",");
  }

  if (selectedFilters.value.genres.length) {
    query.genres = selectedFilters.value.genres.join(",");
  }

  if (selectedFilters.value.themes.length) {
    query.themes = selectedFilters.value.themes.join(",");
  }

  if (debouncedSearch.value) {
    query.search = debouncedSearch.value;
  }

  return Object.keys(query).length ? query : undefined;
});

interface GamesResponse {
  total: number;
  data: GameSubmissionWithRelations[];
  limit: number;
  offset: number;
}

// Update useFetch to use the API query parameters
const { data: games, status } = await useFetch<GamesResponse>("/api/games", {
  query: apiQueryParams,
  watch: [apiQueryParams],
});

const pending = computed(() => status.value === "pending");

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
  title: computed(() =>
    Object.values(selectedPlatforms.value).some(Boolean)
      ? `Cross-Play Games (${Object.values(selectedPlatforms.value)
          .filter(Boolean)
          .map(
            p => SUPPORTED_PLATFORMS.find(platform => platform.id === p)?.name
          )
          .join(", ")})`
      : "All Cross-Play Games"
  ),
  meta: [
    {
      name: "description",
      content:
        "Find cross-play games between PC, Mac, PlayStation, Xbox, and Nintendo Switch.",
    },
  ],
});

// Add function to clear filters and refresh page
function clearQueryAndRefreshPage() {
  if (import.meta.client) {
    const url = new URL(window.location.href);
    const baseUrl = `${url.origin}${url.pathname}`;

    window.location.href = `${baseUrl}?`;
  }
}

// Add function to remove individual filters
function removeFilter(chip: { type: string; id: number }) {
  switch (chip.type) {
    case "gameMode":
      selectedFilters.value.gameModes = selectedFilters.value.gameModes.filter(
        id => id !== chip.id
      );
      break;
  }
}

// Add computed for active filter chips
const activeFilterChips = computed(() => {
  const chips: Array<{ type: string; id: number; name: string }> = [];

  selectedFilters.value.gameModes.forEach(id => {
    const mode = GAME_MODES.find(m => m.id === id);
    if (mode) {
      chips.push({ type: "gameMode", id, name: mode.name });
    }
  });

  return chips;
});
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
        <GameCategorySelector
          v-model:game-modes="selectedFilters.gameModes"
          :include="['gameModes']"
        />
      </div>
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
      v-else-if="games?.data?.length"
      class="tw:grid tw:grid-cols-2 tw:sm:grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] tw:gap-4"
    >
      <CrossPlayGameCard
        v-for="submission in games.data"
        :key="submission.id"
        :game="submission"
      />
    </section>

    <p v-else>No submissions found.</p>
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
