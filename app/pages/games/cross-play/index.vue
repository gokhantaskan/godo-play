<script setup lang="ts">
import type { PlatformId } from "~/types/crossPlay";
import { SUPPORTED_PLATFORMS } from "~~/shared/constants";
import type { GameSubmissionWithRelations } from "~~/shared/types";

type SupportedPlatform = (typeof SUPPORTED_PLATFORMS)[number];

interface SelectedPlatforms {
  p1: SupportedPlatform["id"] | null;
  p2: SupportedPlatform["id"] | null;
  p3: SupportedPlatform["id"] | null;
}

definePageMeta({
  name: "CrossPlayGamesPage",
});

// Platform Selection Management
const selectedPlatforms = useState<SelectedPlatforms>(
  "submission-platforms",
  () => ({
    p1: null,
    p2: null,
    p3: null,
  })
);

// Add type safety for platform selection
function isPlatformId(value: unknown): value is PlatformId {
  return typeof value === "number" && !isNaN(value);
}

// Create a computed property for the API query
const platformsQuery = computed(() => {
  const platforms = [
    selectedPlatforms.value.p1,
    selectedPlatforms.value.p2,
    selectedPlatforms.value.p3,
  ].filter(isPlatformId);

  return platforms.length ? { platforms: platforms.join(",") } : undefined;
});

interface GamesResponse {
  total: number;
  data: GameSubmissionWithRelations[];
  limit: number;
  offset: number;
}

// Update useFetch to use the query parameters
const {
  data: response,
  error,
  refresh,
} = await useFetch<GamesResponse>("/api/games", {
  query: platformsQuery,
  watch: [platformsQuery],
});

const totalSubmissionsCount = computed(() => response.value?.total ?? 0);
const filteredSubmissionsCount = computed(
  () => response.value?.data?.length ?? 0
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
      : "Cross-Play Games"
  ),
  meta: [
    {
      name: "description",
      content:
        "Find cross-play games for your favorite platforms between PC, Mac, PlayStation, Xbox, and Nintendo Switch.",
    },
  ],
});
</script>

<template>
  <main class="tw:container tw:space-y-4">
    <header>
      <h1>Cross-Play Games</h1>
      <template v-if="IS_DEV">
        <TheButton @click="refresh">
          <Icon name="lucide:refresh-cw" />
        </TheButton>
      </template>
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

    <section v-if="totalSubmissionsCount">
      <p>
        Showing {{ filteredSubmissionsCount }} of {{ totalSubmissionsCount }}
        games
      </p>
    </section>

    <div v-if="error">
      <Icon name="lucide:alert-circle" />
      <span>Failed to load submissions</span>
    </div>

    <div
      v-else-if="filteredSubmissionsCount"
      class="tw:grid tw:grid-cols-2 tw:sm:grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] tw:gap-4"
    >
      <CrossPlayGameCard
        v-for="submission in response?.data"
        :key="submission.id"
        :game="submission"
      />
    </div>

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
