<script setup lang="ts">
import type { GameSubmissionWithRelations } from "~~/shared/types";
import type { GameDetails } from "~~/shared/types/igdb/gameDetails";

definePageMeta({
  name: "CrossPlayGameDetailsPage",
});

useNuxtApp().hook("page:finish", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const { slug } = useRoute().params;

useHead({
  link: [
    {
      rel: "canonical",
      href: `https://godo-play.com/games/${slug}`,
    },
  ],
});

const { data: dbGame, refresh: refreshDbGame } =
  await useCachedFetch<GameSubmissionWithRelations>(
    `/api/game-details/${slug}`
  );

// Throw 404 if game is not found
if (!dbGame.value) {
  throw createError({
    statusCode: 404,
    message: "Game not found",
  });
}

// Composable for game data fetching
const { data: igdbGame, refresh: refreshIgdbGame } =
  await useFetch<GameDetails>(`/api/games/igdb/${slug}`, {
    key: `igdb-game-${slug}`,
  });

const seoMeta = computed(() => {
  return {
    seoTitle: `${dbGame.value?.name} Crossplay Information`,
    seoDescription: `Learn about ${dbGame.value?.name} and its crossplay support.`,
    seoImage: `https://images.igdb.com/igdb/image/upload/t_screenshot_med/${dbGame.value?.external?.igdbImageId}.jpg`,
  };
});

useSeoMeta({
  title: seoMeta.value.seoTitle,
  ogTitle: `${seoMeta.value.seoTitle} - GodoPlay`,
  twitterTitle: `${seoMeta.value.seoTitle} - GodoPlay`,
  description: seoMeta.value.seoDescription,
  ogDescription: seoMeta.value.seoDescription,
  twitterDescription: seoMeta.value.seoDescription,
  ogImage: seoMeta.value.seoImage,
  twitterImage: seoMeta.value.seoImage,
});

async function refreshGameData() {
  await refreshIgdbGame();
  await refreshDbGame();
}
</script>

<template>
  <div>
    <CrossPlayGameDetails
      :igdb-game="igdbGame ?? null"
      :db-game="dbGame ?? null"
      :game-name="dbGame?.name ?? ''"
    />

    <div v-if="IS_DEV">
      <TheButton @click="refreshGameData"> Refresh </TheButton>
    </div>
  </div>
</template>
