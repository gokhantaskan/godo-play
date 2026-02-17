<script setup lang="ts">
import { refDebounced } from "@vueuse/core";

import { useCookieConsent } from "@/composables/useCookieConsent";
import type { PlatformId } from "~/types/crossPlay";
import { SUPPORTED_PLATFORMS } from "~~/shared/constants";
import type { GameWithRelations } from "~~/shared/types";

interface InitialRouteQuery {
  platforms: string;
  stores: string;
  gameModes: string;
  tags: string;
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
  tags: number[];
  freeToPlay: boolean;
}

interface GamesResponse {
  total: number;
  data: GameWithRelations[];
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

const {
  proxy: { clarity },
} = useClarityScript();
const { cookieConsent } = useCookieConsent();
const route = useRoute();
const {
  platforms: initialQueryPlatforms,
  gameModes: initialQueryGameModes,
  tags: initialQueryTags,
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

// Use session state for game modes and tags
const { gameModes: sessionGameModes, tags: sessionTags } = useSessionState();
const gameModes = ref<ReadGameMode[]>([]);
const tags = ref<ReadTag[]>([]);

// Fetch game modes server-side if possible
const { data: serverGameModes } = await useFetch<ReadGameMode[]>(
  "/api/public/game-modes"
);

// Fetch tags server-side if possible
const { data: serverTags } = await useFetch<ReadTag[]>("/api/public/tags");

// Use server data first, then fall back to session state
if (serverGameModes.value) {
  gameModes.value = serverGameModes.value;
  // Update session state with server data
  sessionGameModes.value = [...serverGameModes.value];
}

// Use server data first for tags, then fall back to session state
if (serverTags.value) {
  tags.value = serverTags.value;
  // Update session state with server data
  sessionTags.value = [...serverTags.value];
}

// Watch for changes in session game modes
watch(
  sessionGameModes,
  newValue => {
    if (newValue.length > 0) {
      gameModes.value = newValue;
    }
  },
  { immediate: true }
);

// Watch for changes in session tags
watch(
  sessionTags,
  newValue => {
    if (newValue.length > 0) {
      tags.value = newValue;
    }
  },
  { immediate: true }
);

// Create game modes maps for slug/ID conversions
const supportedModesMap = computed(() => {
  const idToSlug: Record<number, string> = {};
  const slugToId: Record<string, number> = {};

  gameModes.value.forEach(mode => {
    idToSlug[mode.id] = mode.slug;
    slugToId[mode.slug] = mode.id;
  });

  return { idToSlug, slugToId };
});

// Convert game mode slugs to IDs
function getGameModeIdFromSlug(slug: string): number | null {
  const gameMode = gameModes.value.find(mode => mode.slug === slug);
  return gameMode ? gameMode.id : null;
}

// Create tags maps for slug/ID conversions
const supportedTagsMap = computed(() => {
  const idToSlug: Record<number, string> = {};
  const slugToId: Record<string, number> = {};

  tags.value.forEach(tag => {
    idToSlug[tag.id] = tag.slug;
    slugToId[tag.slug] = tag.id;
  });

  return { idToSlug, slugToId };
});

// Convert tag slugs to IDs
function getTagIdFromSlug(slug: string): number | null {
  const tag = tags.value.find(tag => tag.slug === slug);
  return tag ? tag.id : null;
}

// Initialize selectedFilters
const selectedFilters = ref<Filters>({
  stores: [],
  gameModes: [],
  tags: [],
  freeToPlay: initialQueryFreeToPlay === "true",
});

// Update selected game modes when session data loads
watch(
  gameModes,
  newValue => {
    if (newValue.length > 0 && initialQueryGameModes) {
      selectedFilters.value.gameModes = initialQueryGameModes
        .split(",")
        .map(slug => getGameModeIdFromSlug(slug))
        .filter((id): id is number => id !== null);
    }
  },
  { immediate: true }
);

// Update selected tags when session data loads
watch(
  tags,
  newValue => {
    if (newValue.length > 0 && initialQueryTags) {
      selectedFilters.value.tags = initialQueryTags
        .split(",")
        .map(slug => getTagIdFromSlug(slug))
        .filter((id): id is number => id !== null);
    }
  },
  { immediate: true }
);

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
      .map(id => supportedModesMap.value.idToSlug[id])
      .join(",");
  }

  if (selectedFilters.value.stores.length) {
    queryToSet.stores = selectedFilters.value.stores.join(",");
  }

  if (selectedFilters.value.tags.length) {
    queryToSet.tags = selectedFilters.value.tags
      .map(id => supportedTagsMap.value.idToSlug[id])
      .join(",");
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

// Update apiQueryParams to include sort and tags
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

  if (selectedFilters.value.tags.length) {
    query.tags = selectedFilters.value.tags.join(",");
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
const stopUrlQueryWatch = watch(
  urlQuery,
  newQuery => {
    useRouter().replace({
      query: newQuery,
    });
  },
  { deep: true }
);

// Track platform changes with Clarity
const stopPlatformsWatch = watch(
  selectedPlatforms,
  (newPlatforms, oldPlatforms) => {
    // Only run on actual changes, not initial setup
    if (oldPlatforms && Object.values(newPlatforms).some(v => v !== null)) {
      const platformNames = Object.values(newPlatforms)
        .filter(Boolean)
        .map(id => SUPPORTED_PLATFORMS.find(p => p.id === id)?.name)
        .filter(Boolean);

      if (cookieConsent.value === true) {
        clarity("set", "platformSelectionChanged", platformNames);
      }
    }
  },
  { deep: true }
);

// Track filter changes with Clarity
const stopGameModesWatch = watch(
  () => selectedFilters.value.gameModes,
  (newModes, oldModes) => {
    if (oldModes && newModes.length !== oldModes.length) {
      const modeNames = newModes
        .map(id => gameModes.value.find(m => m.id === id)?.name)
        .filter(Boolean);

      if (cookieConsent.value === true) {
        clarity("set", "gameModesChanged", modeNames);
      }
    }
  }
);

// Track tag changes with Clarity
const stopTagsWatch = watch(
  () => selectedFilters.value.tags,
  (newTags, oldTags) => {
    if (oldTags && newTags.length !== oldTags.length) {
      const tagNames = newTags
        .map(id => tags.value.find(t => t.id === id)?.name)
        .filter(Boolean);

      if (cookieConsent.value === true) {
        clarity("set", "tagsChanged", tagNames);
      }
    }
  }
);

const stopFreeToPlayWatch = watch(
  () => selectedFilters.value.freeToPlay,
  (newValue, oldValue) => {
    if (oldValue !== undefined && newValue !== oldValue) {
      if (cookieConsent.value === true) {
        clarity("set", "freeToPlayFilterChanged", newValue);
      }
    }
  }
);

// Clean up all watchers when component is unmounted
onUnmounted(() => {
  stopUrlQueryWatch();
  stopPlatformsWatch();
  stopGameModesWatch();
  stopTagsWatch();
  stopFreeToPlayWatch();
});

useHead({
  title: computed(() => getMetaTitle()),
});

useSeoMeta({
  ogUrl: `https://godo-play.com/games`,
  title: computed(() => `${getMetaTitle()}`),
  ogTitle: computed(() => `${getMetaTitle()}`),
  twitterTitle: computed(() => `${getMetaTitle()}`),
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
  if (cookieConsent.value === true) {
    clarity("event", "refreshGamesPage");
  }

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
    case "tag":
      selectedFilters.value.tags = selectedFilters.value.tags.filter(
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
    const mode = gameModes.value.find(m => m.id === id);
    if (mode) {
      chips.push({ type: "gameMode", id, name: mode.name });
    }
  });

  selectedFilters.value.tags.forEach(id => {
    const tag = tags.value.find(t => t.id === id);
    if (tag) {
      chips.push({ type: "tag", id, name: tag.name });
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
          v-model:tags="selectedFilters.tags"
          v-model:free-to-play="selectedFilters.freeToPlay"
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
