<script setup lang="ts">
import { SUPPORTED_PLATFORM_IDS } from "~~/shared/constants/platforms";
import type { GameDetails } from "~~/shared/types/igdb/gameDetails";

const props = withDefaults(
  defineProps<{
    details?: GameDetails;
    isLoading: boolean;
  }>(),
  {
    details: undefined,
    isLoading: false,
  }
);

const trustedWebsites = computed(() => {
  return props.details?.websites.filter(website => website.trusted);
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
    mode => SUPPORTED_PLATFORM_IDS.indexOf(mode.platform!) !== -1
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
        <NuxtImg
          :src="`https://images.igdb.com/igdb/image/upload/t_720p/${details.cover.image_id}.jpg`"
          :alt="`Cover of ${details.name}`"
          :width="details.cover.width"
          :height="details.cover.height"
        />
      </div>

      <div class="game-details__content">
        <div class="game-details__section">
          <h3 class="game-details__section-title">Companies</h3>
          <p class="game-details__section-content">
            <template v-if="details.involved_companies">
              <!-- eslint-disable -->
              <span
                v-for="(company, idx) in details.involved_companies"
                :key="company.id"
                class="tw:inline-block"
              >
                {{ company.company.name
                }}<span v-if="idx < details.involved_companies.length - 1"
                  >,&nbsp;</span
                >
              </span>
              <!-- eslint-enable -->
            </template>
            <span v-else>No data</span>
          </p>
        </div>

        <div class="game-details__section">
          <h3 class="game-details__section-title">Game Modes</h3>
          <p class="game-details__section-content">
            {{ details.game_modes.map(mode => mode.name).join(", ") }}
          </p>
          <div class="game-details__section-content">
            <GameDetailsMultiplayerMode
              v-for="mode in availableMultiplayerModes"
              :key="mode.id"
              :multiplayer-mode="mode"
            />
          </div>
        </div>

        <div class="game-details__section">
          <h3 class="game-details__section-title">Available Platforms</h3>
          <div class="tw:flex tw:flex-wrap tw:gap-1">
            <TheChip
              v-for="platform in details.platforms.toSorted((a, b) =>
                a.name.localeCompare(b.name)
              )"
              :key="platform.id"
              :label="platform.name"
              variant="gray"
            />
          </div>
        </div>

        <div class="game-details__section">
          <h3 class="game-details__section-title">Categories</h3>
          <div class="tw:flex tw:flex-wrap tw:gap-1">
            <TheChip
              v-for="category in allCategories"
              :key="category.id"
              :label="category.name"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="game-details__section">
      <h3 class="game-details__section-title">Gallery</h3>
      <div class="game-details__screenshots">
        <template
          v-for="sc in details.screenshots"
          :key="sc.id"
        >
          <NuxtImg
            :src="`https://images.igdb.com/igdb/image/upload/t_screenshot_big/${sc.image_id}.jpg`"
            :alt="''"
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
