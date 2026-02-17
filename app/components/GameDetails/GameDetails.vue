<script setup lang="ts">
import type { PlatformId } from "~/types/crossPlay";
import { SUPPORTED_PLATFORM_IDS } from "~~/shared/constants/platforms";
import type { GameDetails } from "~~/shared/types/igdb/gameDetails";

const props = defineProps<{
  details?: GameDetails;
  isLoading?: boolean;
}>();

const trustedWebsites = computed(() => {
  return props.details?.websites?.filter(website => website.trusted);
});

const allCategories = computed(() => {
  return [
    ...(props.details?.genres ?? []),
    ...(props.details?.themes ?? []),
    ...(props.details?.player_perspectives ?? []),
  ];
});

const availableMultiplayerModes = computed(() => {
  const multiplayerModes = props.details?.multiplayer_modes;

  if (!multiplayerModes) {
    return [];
  }

  if (multiplayerModes.length === 1) {
    return multiplayerModes;
  }

  return multiplayerModes.filter(
    mode =>
      SUPPORTED_PLATFORM_IDS.indexOf((mode.platform as PlatformId)!) !== -1
  );
});
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div
    v-else-if="details"
    class="game-details"
  >
    <div class="game-details__main">
      <div class="game-details__cover">
        <img
          :src="`https://images.igdb.com/igdb/image/upload/t_720p/${details.cover.image_id}.jpg`"
          :alt="`Cover image of ${details.name}`"
          :width="details.cover.width"
          :height="details.cover.height"
        />
      </div>

      <div class="game-details__metadata">
        <div class="game-details__section">
          <div class="game-details__section-content">
            <p>{{ details.game_modes.map(mode => mode.name).join(", ") }}</p>
            <div
              v-if="allCategories.length"
              class="tw:flex tw:flex-wrap tw:gap-1 tw:[margin-block-start:0.5rem]"
            >
              <TheChip
                v-for="category in allCategories"
                :key="category.id"
                :label="category.name"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <GameDetailsAgeRatings
      v-if="details.age_ratings?.length"
      :age-ratings="details.age_ratings"
    />

    <div class="game-details__section">
      <h3 class="game-details__section-title">Available Platforms</h3>
      <div class="game-details__section-content tw:flex tw:flex-wrap tw:gap-1">
        {{
          details.platforms
            .toSorted((a, b) => a.name.localeCompare(b.name))
            .map(platform => platform.name)
            .join(", ")
        }}
      </div>
    </div>

    <div class="game-details__section">
      <h3 class="game-details__section-title tw:sr-only">Companies</h3>
      <p class="game-details__section-content">
        <GameDetailsCompanies
          :companies="details.involved_companies"
          :first-release-date="details.first_release_date"
        />
      </p>
    </div>

    <div
      v-if="availableMultiplayerModes.length"
      class="game-details__section"
    >
      <h3 class="game-details__section-title">Multiplayer Modes</h3>
      <div class="game-details__section-content">
        <div class="game-details__section-content">
          <GameDetailsMultiplayerModes
            :multiplayer-modes="availableMultiplayerModes"
          />
        </div>
      </div>
    </div>

    <div
      v-if="details.screenshots?.length"
      class="game-details__section"
    >
      <h3 class="game-details__section-title">Gallery</h3>
      <div class="game-details__screenshots">
        <template
          v-for="sc in details.screenshots"
          :key="sc.id"
        >
          <img
            :src="`https://images.igdb.com/igdb/image/upload/t_screenshot_big/${sc.image_id}.jpg`"
            :alt="`Screenshot of ${details.name}`"
            :width="sc.width"
            :height="sc.height"
            class="tw:aspect-video tw:max-w-80"
          />
        </template>
      </div>
    </div>

    <div
      v-if="trustedWebsites?.length"
      class="game-details__section"
    >
      <h3 class="game-details__section-title">Websites</h3>
      <p class="game-details__section-content tw:italic tw:mb-3">
        The links provided are sourced from a third-party API. Please proceed
        with caution and only click on them if you trust the source.
      </p>

      <GameDetailsWebsites :websites="trustedWebsites" />
    </div>
  </div>
</template>
