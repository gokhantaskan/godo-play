<script setup lang="ts">
import type { DashboardGame } from "~/lib/types/igdb";

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

function openModal() {
  isModalOpen.value = true;
}
</script>

<template>
  <div
    class="game-card"
    role="listitem"
  >
    <div
      class="game-card__cover"
      role="button"
      tabindex="0"
      @click.stop="openModal"
      @keyup.enter="openModal"
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
        role="button"
        tabindex="0"
        @click.stop="openModal"
        @keyup.enter="openModal"
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
    </div>

    <!-- Game Details Modal -->
    <TheModal
      v-model:open="isModalOpen"
      :title="game.name"
    >
      <div class="game-details">
        <!-- Cover Image -->
        <div
          v-if="game.cover?.image_id"
          class="game-details__cover"
        >
          <NuxtImg
            :src="getImageUrl(game.cover.image_id)"
            :alt="game.name"
            :width="game.cover.width"
            :height="game.cover.height"
            loading="lazy"
            quality="80"
          />
        </div>

        <!-- Game Info -->
        <div class="game-details__info">
          <!-- Game Type -->
          <div
            v-if="game.category !== 0"
            class="game-details__type"
          >
            <Icon :name="gameType.icon" />
            <span>{{ gameType.label }}</span>
          </div>

          <!-- Game Modes -->
          <div
            v-if="gameModesAsString"
            class="game-details__section"
          >
            <h4>Game Modes</h4>
            <p>{{ gameModesAsString }}</p>
          </div>

          <!-- Categories -->
          <div
            v-if="categories.length"
            class="game-details__section"
          >
            <h4>Categories</h4>
            <div class="game-details__tags">
              <TheChip
                v-for="category in categories"
                :key="category"
                :label="category"
                :color="gameType.type"
              />
            </div>
          </div>

          <!-- Summary -->
          <div
            v-if="game.summary"
            class="game-details__section"
          >
            <h4>Summary</h4>
            <p>{{ game.summary }}</p>
          </div>
        </div>
      </div>
    </TheModal>
  </div>
</template>
