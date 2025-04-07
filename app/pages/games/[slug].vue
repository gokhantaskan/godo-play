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
    `/api/public/games/${slug}`
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
  await useCachedFetch<GameDetails>(`/api/public/igdb/${slug}`);

const seoMeta = computed(() => {
  return {
    seoTitle: `${dbGame.value?.name} Crossplay Information`,
    seoDescription:
      igdbGame.value?.summary ??
      `Learn about ${dbGame.value?.name}'s cross platform and cross save features.`,
    seoImage: `https://images.igdb.com/igdb/image/upload/t_screenshot_med/${dbGame.value?.external?.igdbImageId}.jpg`,
  };
});

useSeoMeta({
  title: seoMeta.value.seoTitle,
  description: seoMeta.value.seoDescription.slice(0, 155),
  twitterDescription: seoMeta.value.seoDescription.slice(0, 155),
  ogType: "article",
  ogTitle: `${seoMeta.value.seoTitle} - GodoPlay`,
  ogDescription: seoMeta.value.seoDescription.slice(0, 155),
  ogUrl: `https://godo-play.com/games/${slug}`,
  ogLocale: "en_US",
  ogImage: seoMeta.value.seoImage,
  twitterTitle: `${seoMeta.value.seoTitle} - GodoPlay`,
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
