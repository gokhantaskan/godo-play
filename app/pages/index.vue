<script setup lang="ts">
import { debounce } from "lodash-es";

import type { PlatformId } from "@/components/PlatformSelect.vue";
import { GAME_MODE_IDS } from "~~/shared/constants/gameModes";
import { PLATFORMS } from "~~/shared/constants/platforms";

type InitialQuery = {
  gameModes?: string; // Comma-separated list of game mode IDs
  playerPerspectives?: string; // Comma-separated list of player perspective IDs
  genres?: string; // Comma-separated list of genre IDs
  themes?: string; // Comma-separated list of theme IDs
  platforms?: string; // Comma-separated list of platform IDs
  search?: string;
};

const route = useRoute();
const router = useRouter();
const initialQuery = route.query as InitialQuery;

// PLATFORMS
const initialPlatforms = initialQuery.platforms?.split(",").map(Number);
const selectedPlatforms = reactive<{
  p1: PlatformId;
  p2: PlatformId | null;
  p3: PlatformId | null;
}>({
  p1: initialPlatforms?.[0] ?? PLATFORMS[0]!.id,
  p2: initialPlatforms?.[1] ?? null,
  p3: initialPlatforms?.[2] ?? null,
});

const availablePlatforms = reactive({
  p1: computed(() =>
    PLATFORMS.filter(
      platform =>
        platform.id !== selectedPlatforms["p2"] &&
        platform.id !== selectedPlatforms["p3"]
    )
  ),
  p2: computed(() =>
    PLATFORMS.filter(
      platform =>
        platform.id !== selectedPlatforms["p1"] &&
        platform.id !== selectedPlatforms["p3"]
    )
  ),
  p3: computed(() =>
    PLATFORMS.filter(
      platform =>
        platform.id !== selectedPlatforms["p1"] &&
        platform.id !== selectedPlatforms["p2"]
    )
  ),
});

// GAME MODES
const initialGameModes = initialQuery.gameModes?.split(",").map(Number);
const selectedGameModes = ref<number[]>(initialGameModes || []);

// PLAYER PERSPECTIVES
const initialPlayerPerspectives = initialQuery.playerPerspectives
  ?.split(",")
  .map(Number);
const selectedPlayerPerspectives = ref<number[]>(
  initialPlayerPerspectives || []
);

// GENRES
const initialGenres = initialQuery.genres?.split(",").map(Number);
const selectedGenres = ref<number[]>(initialGenres || []);

// THEMES
const initialThemes = initialQuery.themes?.split(",").map(Number);
const selectedThemes = ref<number[]>(initialThemes || []);

// SORT
const sortBy = ref<string>("aggregated_rating");
const sortOrder = ref<"asc" | "desc">("desc");

// SEARCH
const search = ref<string>(initialQuery.search?.toString() || "");

// Debounce the search to avoid too many requests
watch(
  search,
  debounce(() => {
    execute();

    const query = {
      ...route.query,
      search: search.value || undefined,
    };

    router.replace({ query });
  }, 500)
);

// QUERIES
const platformsQuery = computed(() => {
  const platforms = [selectedPlatforms["p1"]];

  if (selectedPlatforms["p2"]) {
    platforms.push(selectedPlatforms["p2"]);
  }

  if (selectedPlatforms["p3"]) {
    platforms.push(selectedPlatforms["p3"]);
  }

  return platforms.join(",");
});

const whereQuery = computed(() => {
  const conditions = [`platforms=[${platformsQuery.value}]`];

  if (search.value) {
    conditions.push(`name ~ *"${search.value}"*`);
  }

  if (selectedGameModes.value.length > 0) {
    conditions.push(`game_modes=[${selectedGameModes.value.join(",")}]`);
  } else {
    conditions.push(`game_modes=(${GAME_MODE_IDS.join(",")})`);
  }

  if (selectedPlayerPerspectives.value.length > 0) {
    conditions.push(
      `player_perspectives=(${selectedPlayerPerspectives.value.join(",")})`
    );
  }

  if (selectedGenres.value.length > 0) {
    conditions.push(`genres=(${selectedGenres.value.join(",")})`);
  }

  if (selectedThemes.value.length > 0) {
    conditions.push(`themes=(${selectedThemes.value.join(",")})`);
  }

  return conditions.join(" & ");
});

watch(
  [
    selectedGameModes,
    selectedPlayerPerspectives,
    selectedGenres,
    selectedThemes,
    platformsQuery,
  ],
  ([gameModes, playerPerspectives, genres, themes, platforms]) => {
    const query = {
      ...route.query,
      gameModes: gameModes?.length ? gameModes.join(",") : undefined,
      genres: genres?.length ? genres.join(",") : undefined,
      themes: themes?.length ? themes.join(",") : undefined,
      playerPerspectives: playerPerspectives?.length
        ? playerPerspectives.join(",")
        : undefined,
      platforms,
    };

    router.replace({ query });
  },
  { deep: true, immediate: true }
);

// DATA FETCHING
const {
  status,
  data: games,
  execute,
} = useFetch("/api/games", {
  method: "POST",
  body: {
    where: whereQuery.value,
    sort: `${sortBy.value} ${sortOrder.value}`,
    limit: 100,
  },
  immediate: false,
  watch: [
    selectedPlatforms,
    selectedGameModes,
    selectedPlayerPerspectives,
    selectedGenres,
    selectedThemes,
    sortBy,
    sortOrder,
  ],
});

const pending = computed(() => status.value === "pending");

// LIFE CYCLE HOOKS
onMounted(async () => {
  await getTwAccess();
  await execute();
});

// UTILS
async function getTwAccess() {
  await $fetch("/api/auth/twitch", {
    method: "POST",
  });
}

function refresh() {
  if (import.meta.client) {
    window.location.href = window.location.origin;
  }
}
</script>

<template>
  <main class="tw:container tw:space-y-4">
    <header class="tw:flex tw:justify-between tw:items-center tw:gap-4">
      <h1 class="tw:font-bold">GōdōPlay</h1>
      <button
        aria-label="Refresh"
        @click="refresh"
      >
        <Icon name="lucide:refresh-cw" />
      </button>
    </header>

    <div class="tw:text-sm tw:text-gray-700 tw:max-w-[80ch]">
      <p class="tw:mb-2">
        Inspired by the Japanese word Gōdō (合同), meaning "fusion" or "coming
        together," GōdōPlay is your go-to app for discovering co-op and
        multiplayer games across PC, PlayStation, Xbox, and Nintendo Switch.
      </p>
      <p>
        Whether you're teaming up with friends for unforgettable adventures or
        diving into intense multiplayer battles, GōdōPlay seamlessly brings
        gamers together. Explore the best cross-platform games and connect with
        ease—because gaming is better when shared.
      </p>
    </div>

    <div class="tw:flex tw:max-sm:flex-col tw:gap-4">
      <PlatformSelect
        v-model="selectedPlatforms.p1"
        :platforms="availablePlatforms.p1"
        label="Platform 1"
        required
      />

      <PlatformSelect
        v-model="selectedPlatforms.p2"
        :platforms="availablePlatforms.p2"
        label="Platform 2"
      />

      <PlatformSelect
        v-model="selectedPlatforms.p3"
        :platforms="availablePlatforms.p3"
        label="Platform 3"
      />
    </div>

    <div>
      <SearchInput
        v-model="search"
        placeholder="Search by name"
      />
    </div>

    <div>
      <GameCategorySelector
        v-model:game-modes="selectedGameModes"
        v-model:player-perspectives="selectedPlayerPerspectives"
        v-model:genres="selectedGenres"
        v-model:themes="selectedThemes"
      />
    </div>

    <!-- Loading -->
    <div
      v-if="pending"
      class="tw:flex tw:justify-center tw:items-center tw:min-h-[200px]"
    >
      <LoadingSpinner />
    </div>
    <!-- Error -->
    <div v-else-if="status === 'error'">
      <p class="tw:text-red-500">Error fetching games</p>
    </div>
    <!-- No games found -->
    <div v-else-if="status === 'success' && games?.length === 0">
      <p class="tw:text-gray-600">No games found</p>
    </div>
    <!-- Success -->
    <div
      v-else-if="games"
      role="list"
      class="tw:grid tw:grid-cols-2 tw:gap-4 tw:sm:grid-cols-3 tw:lg:grid-cols-4 tw:xl:grid-cols-5"
    >
      <GameCard
        v-for="game in games"
        :key="game.id"
        :game="game"
      />
    </div>
  </main>
</template>
