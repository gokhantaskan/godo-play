<script setup lang="ts">
const { slug } = useRoute().params;

const { data: igdbGame } = await useFetch(`/api/games/igdb/${slug}`);
const { data: game } = useFetch(`/api/game-details/${slug}`, {
  server: false,
});
</script>

<template>
  <div class="game">
    <header class="game__header">
      <div class="game__hero">
        <div class="tw:container">
          <div class="game__hero-content">
            <img
              :src="`https://images.igdb.com/igdb/image/upload/t_720p/${igdbGame?.cover.image_id}.jpg`"
              :alt="igdbGame?.name"
              :width="igdbGame?.cover.width"
              :height="igdbGame?.cover.height"
              class="game__hero-cover"
            />
            <div class="game__hero-info">
              <h1 class="game__hero-title">{{ igdbGame?.name }}</h1>
              <p class="game__hero-summary">{{ igdbGame?.summary }}</p>
            </div>
          </div>
        </div>
        <div class="game__hero-background">
          <img
            :src="`https://images.igdb.com/igdb/image/upload/t_screenshot_med/${igdbGame?.cover.image_id}.jpg`"
            :alt="igdbGame?.name"
            class="game__hero-background-image"
          />
        </div>
      </div>
    </header>

    <div class="tw:container">
      <div v-if="game?.platformGroups?.length">
        <CrossPlayGameCardPlatformGroups
          :platform-groups="game.platformGroups"
          :pc-stores="game?.storePlatforms"
        />
      </div>
      <p class="game__description">{{ igdbGame?.storyline }}</p>
      <pre>{{ game }}</pre>
    </div>
  </div>
</template>
