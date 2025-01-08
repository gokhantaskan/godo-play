<script setup lang="ts">
import type { GameDetails } from "~~/shared/types/igdb/gameDetails";

const props = withDefaults(
  defineProps<{
    details: GameDetails;
    isLoading: boolean;
  }>(),
  {
    isLoading: false,
  }
);

const trustedWebsites = computed(() => {
  return props.details.websites.filter(website => website.trusted);
});
</script>

<template>
  <div
    v-if="isLoading"
    class="tw:flex tw:items-center tw:justify-center tw:min-h-[400px]"
  >
    <TheSpinner />
  </div>
  <div
    v-else
    class="game-details"
  >
    <div class="game-details__main">
      <div class="game-details__cover">
        <NuxtImg
          :src="`https://images.igdb.com/igdb/image/upload/t_720p/${details.cover.image_id}.jpg`"
          :alt="`Cover of ${details.name}`"
        />
      </div>

      <div class="game-details__content">
        <div class="game-details__section">
          <h3 class="game-details__section-title">Game Modes</h3>
          <p class="game-details__section-content">
            {{ details.game_modes.map(mode => mode.name).join(", ") }}
          </p>
        </div>

        <div class="game-details__section">
          <h3 class="game-details__section-title">Platforms</h3>
          <div class="tw:flex tw:flex-wrap tw:gap-1">
            <TheChip
              v-for="platform in details.platforms.toSorted()"
              :key="platform.id"
              :label="platform.name"
              variant="primary"
            />
          </div>
        </div>

        <div class="game-details__section">
          <h3 class="game-details__section-title">Categories</h3>
          <div class="tw:flex tw:flex-wrap tw:gap-1">
            <TheChip
              v-for="mode in details.game_modes"
              :key="mode.id"
              :label="mode.name"
            />
            <TheChip
              v-for="theme in details.themes"
              :key="theme.id"
              :label="theme.name"
            />
            <TheChip
              v-for="genre in details.genres"
              :key="genre.id"
              :label="genre.name"
            />
            <TheChip
              v-for="perspective in details.player_perspectives"
              :key="perspective.id"
              :label="perspective.name"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="game-details__section">
      <h3 class="game-details__section-title">Screenshots</h3>
      <div
        class="game-details__screenshots tw:flex tw:flex-nowrap tw:overflow-x-auto tw:gap-3 tw:pb-4"
      >
        <template
          v-for="sc in details.screenshots"
          :key="sc.id"
        >
          <NuxtImg
            :src="`https://images.igdb.com/igdb/image/upload/t_screenshot_big/${sc.image_id}.jpg`"
            :alt="''"
            class="tw:w-full tw:h-auto tw:max-w-96"
          />
        </template>
      </div>
    </div>

    <div
      v-if="trustedWebsites.length"
      class="game-details__section"
    >
      <h3 class="game-details__section-title">Websites</h3>
      <p class="game-details__section-content tw:italic tw:mb-3">
        The links provided are sourced from a third-party API. Please proceed
        with caution and only click on them if you trust the source.
      </p>
      <ul class="game-details__websites">
        <li
          v-for="website in trustedWebsites"
          :key="website.id"
        >
          <NuxtLink
            :to="website.url"
            target="_blank"
            class="tw:inline-flex tw:items-center tw:gap-1"
          >
            {{ website.url }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
