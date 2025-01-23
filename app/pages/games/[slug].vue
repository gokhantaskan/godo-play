<script setup lang="ts">
const { slug } = useRoute().params;

const { data: game } = await useFetch(`/api/games/external/${slug}`);
</script>

<template>
  <div class="game">
    <header class="game__header">
      <div class="game__hero">
        <div class="tw:container">
          <div class="game__hero-content">
            <NuxtImg
              :src="`https://images.igdb.com/igdb/image/upload/t_cover_big/${game?.cover.image_id}.jpg`"
              :alt="game?.name"
              :width="game?.cover.width"
              :height="game?.cover.height"
              :quality="80"
              class="game__hero-cover"
            />
            <div class="game__hero-info">
              <h1 class="game__hero-title">{{ game?.name }}</h1>
              <p class="game__hero-summary">{{ game?.summary }}</p>
            </div>
          </div>
        </div>
        <div class="game__hero-background">
          <NuxtImg
            :src="`https://images.igdb.com/igdb/image/upload/t_screenshot_big/${game?.cover.image_id}.jpg`"
            :alt="game?.name"
            :quality="10"
            class="game__hero-background-image"
          />
        </div>
      </div>
    </header>

    <div class="tw:container">
      <p class="game__description">{{ game?.storyline }}</p>
      <!-- <pre>{{ game }}</pre> -->
    </div>
  </div>
</template>
