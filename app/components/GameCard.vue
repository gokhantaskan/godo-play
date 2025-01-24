<script setup lang="ts">
import { GAME_TYPES } from "~~/shared/constants";
import type { DashboardGame } from "~~/shared/types/igdb/dashboardGames";

interface Props {
  game: DashboardGame;
}

const props = defineProps<Props>();
const isModalOpen = ref(false);

const gameModesAsString = computed(() => {
  return props.game.game_modes?.map(mode => mode.name).join(", ");
});

const categories = computed(() => {
  return [
    // Genres
    ...(props.game.genres?.map(genre => genre.name) || []),
    // Themes
    ...(props.game.themes?.map(theme => {
      if (theme.name.toLowerCase().startsWith("4x")) {
        return "4X";
      }

      return theme.name;
    }) || []),
  ];
});

const gameType = computed(() => {
  return GAME_TYPES[props.game.category];
});

const cacheKey = computed(() => `game-${props.game.id}`);
const { data: cachedGameDetails } = useNuxtData(cacheKey.value);
const {
  data: gameDetails,
  status: gameDetailsStatus,
  execute: fetchGameDetails,
} = useFetch(`/api/games/igdb/${props.game.slug}`, {
  immediate: false,
  key: cacheKey.value,
  lazy: !!cachedGameDetails.value,
});

const pendingGameDetails = computed(() => {
  return gameDetailsStatus.value === "pending";
});

function getImageUrl(imageId: string) {
  return `https://images.igdb.com/igdb/image/upload/t_720p/${imageId}.jpg`;
}

async function openModal() {
  isModalOpen.value = true;
  await fetchGameDetails();
}
</script>

<template>
  <div
    class="game-card"
    role="listitem"
  >
    <button
      class="game-card__cover"
      role="button"
      @click="openModal"
    >
      <NuxtImg
        v-if="game.cover?.image_id"
        :src="getImageUrl(game.cover.image_id)"
        :alt="game.name"
        :width="game.cover.width"
        :height="game.cover.height"
        loading="lazy"
        quality="80"
      />
      <div
        v-else
        class="game-card__no-cover"
      >
        No Image
      </div>
      <!-- Game Type CircleBadge -->
      <template v-if="gameType">
        <div
          v-if="game.category !== 0"
          class="game-card__badge"
          :class="`game-card__badge--${gameType.slug}`"
          :title="gameType.label"
        >
          <Icon :name="gameType.icon" />
        </div>
      </template>
    </button>
    <div class="game-card__content">
      <!-- Game name -->
      <h3
        class="game-card__title"
        :title="game.name"
      >
        {{ game.name }}
      </h3>
      <!-- Game modes -->
      <div class="game-card__game-modes">
        {{ gameModesAsString }}
      </div>
      <!-- Genres & Themes -->
      <div
        v-if="categories.length"
        class="game-card__tags"
      >
        <template v-if="categories.length">
          <TheChip
            v-for="category in categories"
            :key="category"
            :label="category"
            :color="gameType?.slug"
          />
        </template>
      </div>
    </div>

    <!-- Game Details Modal -->
    <TheModal
      :key="game.id"
      v-model:open="isModalOpen"
      :title="game.name"
      max-width="48rem"
    >
      <template #description>
        <div
          v-if="gameType"
          class="tw:flex tw:items-center tw:gap-2"
        >
          <Icon
            :name="gameType.icon"
            class="tw:text-xl"
          />
          <span>{{ gameType.label }}</span>
        </div>
      </template>
      <GameDetails
        :details="gameDetails"
        :is-loading="!gameDetails && pendingGameDetails"
      />
    </TheModal>
  </div>
</template>
