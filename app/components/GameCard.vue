<script setup lang="ts">
import type { DashboardGame } from "~/lib/types/igdb";

interface Props {
  game: DashboardGame;
}

const props = defineProps<Props>();

const gameModesAsString = computed(() => {
  return props.game.game_modes?.map(mode => mode.name).join(", ");
});

const categories = computed(() => {
  return [
    ...(props.game.genres?.map(genre => genre.name) || []),
    ...(props.game.themes?.map(theme => {
      if (theme.name.toLowerCase().startsWith("4x")) {
        return "4X";
      }

      return theme.name;
    }) || []),
    ...(props.game.player_perspectives?.map(perspective => perspective.name) ||
      []),
  ];
});

const gameType = computed(() => {
  switch (props.game.category) {
    case 3:
      return { label: "Bundle", icon: "lucide:combine", type: "collection" };
    case 8:
      return { label: "Remake", icon: "lucide:refresh-cw", type: "remake" };
    case 9:
      return { label: "Remaster", icon: "lucide:refresh-cw", type: "remaster" };
    default:
      return { label: "Main Game", icon: "lucide:gamepad", type: "main" };
  }
});

function getImageUrl(imageId: string) {
  return `https://images.igdb.com/igdb/image/upload/t_720p/${imageId}.jpg`;
}
</script>

<template>
  <div
    class="game-card"
    role="listitem"
  >
    <div class="game-card__cover">
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
      <div
        v-if="game.category !== 0"
        class="game-card__badge"
        :class="`game-card__badge--${gameType.type}`"
        :title="gameType.label"
      >
        <Icon :name="gameType.icon" />
      </div>
    </div>
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
            :color="gameType.type"
          />
        </template>
      </div>
      <!-- Platforms -->
      <!-- <div
        v-if="game.platforms?.length"
        class="game-card__tags"
      >
        <small class="tw:block tw:w-full">Platforms:</small>
        <span
          v-for="platform in game.platforms"
          :key="platform.id"
          class="game-card__tag game-card__tag--platform"
        >
          {{ platform.abbreviation }}
        </span>
      </div> -->
    </div>
  </div>
</template>
