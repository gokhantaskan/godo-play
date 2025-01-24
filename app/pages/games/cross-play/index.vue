<script setup lang="ts">
import type { PlatformId } from "~/types/crossPlay";
import type { SUPPORTED_PLATFORMS } from "~~/shared/constants";
import type { GameSubmissionWithRelations } from "~~/shared/types/games";

type SupportedPlatform = (typeof SUPPORTED_PLATFORMS)[number];

interface SelectedPlatforms {
  p1: SupportedPlatform["id"] | null;
  p2: SupportedPlatform["id"] | null;
  p3: SupportedPlatform["id"] | null;
}

definePageMeta({
  name: "CrossPlayGamesPage",
});

const { data, error, refresh } =
  await useFetch<GameSubmissionWithRelations[]>("/api/games");

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

// Filter submissions based on selected platforms
const filteredSubmissions = computed(() => {
  if (!data.value) {
    return [];
  }

  const platforms = [
    selectedPlatforms.value.p1,
    selectedPlatforms.value.p2,
    selectedPlatforms.value.p3,
  ].filter(isPlatformId);

  if (!platforms.length) {
    if (IS_DEV) {
      return data.value;
    }

    // Filter to show only approved submissions
    return data.value.filter(submission => submission.status === "approved");
  }

  return data.value.filter(submission => {
    // Ensure platformGroups exists and has platformGroupPlatforms
    if (
      !submission.platformGroups?.length ||
      submission.status !== "approved"
    ) {
      return false;
    }

    // If only one platform is selected, check if it exists in any group
    if (platforms.length === 1) {
      return submission.platformGroups.some(group => {
        if (!group.platformGroupPlatforms?.length) {
          return false;
        }

        return group.platformGroupPlatforms.some(
          p => p.platform?.id === platforms[0]
        );
      });
    }

    // Check if all selected platforms exist in the same platform group
    return submission.platformGroups.some(group => {
      if (!group.platformGroupPlatforms?.length) {
        return false;
      }

      const groupPlatformIds = new Set(
        group.platformGroupPlatforms.map(p => p.platform?.id)
      );

      return platforms.every(platformId => groupPlatformIds.has(platformId));
    });
  });
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

    <div v-if="error">
      <Icon name="lucide:alert-circle" />
      <span>Failed to load submissions</span>
    </div>

    <div
      v-else-if="filteredSubmissions.length"
      class="tw:grid tw:grid-cols-2 tw:sm:grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] tw:gap-4"
    >
      <CrossPlayGameCard
        v-for="submission in filteredSubmissions"
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
