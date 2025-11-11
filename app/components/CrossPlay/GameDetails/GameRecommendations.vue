<script setup lang="ts">
import type { GameSubmissionWithRelations } from "~~/shared/types";

interface Props {
  slug: string;
}

const props = defineProps<Props>();
const route = useRoute();

// Get platforms from route query if they exist
const platformsFromQuery = computed(() => {
  const platformsParam = route.query.platforms;
  if (!platformsParam) {
    return undefined;
  }

  // Split platform slugs into an array and convert to platform IDs
  return typeof platformsParam === "string"
    ? platformsParam
        .split(",")
        .map(slug => getPlatformIdBySlug(slug))
        .filter(Boolean)
    : undefined;
});

const { data: recommendedGames, status } = await useCachedFetch<
  GameSubmissionWithRelations[]
>(`/api/public/games/recommendations`, {
  params: {
    query: props.slug,
    limit: 6,
    platforms: platformsFromQuery.value?.join(","),
  },
});

// Skip rendering if no games are found
const hasRecommendations = computed(() => {
  return (
    Array.isArray(recommendedGames.value) && recommendedGames.value.length > 0
  );
});
</script>

<template>
  <div
    v-if="hasRecommendations"
    class="game-recommendations"
  >
    <div class="tw:container">
      <h2 class="tw:text-xl tw:font-bold tw:mb-4">Similar Games</h2>

      <div
        v-if="status === 'success'"
        class="game-recommendations__grid"
      >
        <div
          class="tw:grid tw:grid-cols-2 tw:sm:grid-cols-3 tw:lg:grid-cols-6 tw:gap-4"
        >
          <template
            v-for="game in recommendedGames"
            :key="game.id"
          >
            <CrossPlayGameCard
              :game="game"
              direct-link
            />
          </template>
        </div>
      </div>

      <div
        v-else
        class="tw:flex tw:justify-center tw:py-8"
      >
        <LoadingSpinner />
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-recommendations {
  padding-top: 2rem;
  padding-bottom: 2rem;
  margin-top: 1rem;
}
</style>
