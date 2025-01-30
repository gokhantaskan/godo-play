<script setup lang="ts">
import { GAME_TYPES } from "~~/shared/constants";
// import { getCategoryNameByPointer } from "~~/shared/constants/categories";
import type { GameSubmissionWithRelations } from "~~/shared/types";

const props = defineProps<{
  game: GameSubmissionWithRelations;
}>();

const gameType = computed(() => {
  return GAME_TYPES[props.game.category];
});

// TODO: Work on this
const isModalOpen = ref(false);
const cacheKey = computed(() => `game-${props.game.slug}`);
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

async function openModal() {
  isModalOpen.value = true;
  await fetchGameDetails();
}
</script>

<template>
  <article class="game-card">
    <!-- Image Section -->
    <button
      class="game-card__cover"
      @click="openModal"
    >
      <img
        :src="`https://images.igdb.com/igdb/image/upload/t_720p/${game.external?.igdbImageId}.jpg`"
        :alt="game.name"
        preload
        loading="lazy"
      />
    </button>

    <!-- Content Section -->
    <div class="game-card__content">
      <header>
        <!-- <span class="tw:text-xs">{{
          getCategoryNameByPointer(game.category)
        }}</span> -->
        <h2
          class="game-card__title"
          :class="[game.status === 'pending' && 'tw:text-red']"
          :style="{
            textOverflow: 'unset',
            whiteSpace: 'unset',
            // line clamp for 2 lines
            display: '-webkit-box',
            '-webkit-line-clamp': '2',
            '-webkit-box-orient': 'vertical',
          }"
        >
          {{ game.name }}
        </h2>
      </header>

      <div>
        <!-- Game Modes -->
        <div
          v-if="game.gameSubmissionGameModes?.length"
          class="game-card__game-modes"
        >
          {{
            game.gameSubmissionGameModes
              .map(mode => mode.gameMode.name)
              .join(", ")
          }}
        </div>

        <!-- Platform Groups -->
        <div
          v-if="game.platformGroups?.length"
          class="tw:mt-2"
        >
          <CrossPlayGameCardPlatformGroups
            role="listitem"
            :platform-groups="game.platformGroups"
          />
        </div>
      </div>
    </div>

    <!-- Game Details Modal -->
    <TheModal
      :key="game.slug"
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
  </article>
</template>
