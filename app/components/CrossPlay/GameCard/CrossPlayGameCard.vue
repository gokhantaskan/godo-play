<script setup lang="ts">
import type { GameSubmissionWithRelations } from "~~/shared/types";

const props = defineProps<{
  game: GameSubmissionWithRelations;
}>();

const isDialogOpen = ref(false);

function handleCardClick() {
  if (import.meta.client) {
    // Store current URL and update URL with game slug
    history.pushState(
      { dialogOpen: true, originalURL: window.location.href },
      "",
      `/games/${props.game.slug}`
    );
  }
  isDialogOpen.value = true;
}
</script>

<template>
  <article class="game-card">
    <!-- Image Section -->
    <button
      class="clean-button game-card__cover"
      @click="handleCardClick"
    >
      <img
        :src="`https://images.igdb.com/igdb/image/upload/t_720p/${props.game.external?.igdbImageId}.jpg`"
        :alt="props.game.name"
        preload
        loading="lazy"
      />
    </button>

    <CrossPlayGameCardDialog
      v-model:open="isDialogOpen"
      :slug="props.game.slug"
    />

    <!-- Content Section -->
    <div class="game-card__content">
      <header>
        <!-- <span class="tw:text-xs">{{
          getCategoryNameByPointer(props.game.category)
        }}</span> -->
        <h2
          class="game-card__title"
          :class="[props.game.status === 'pending' && 'tw:text-red']"
          :style="{
            textOverflow: 'unset',
            whiteSpace: 'unset',
            // line clamp for 2 lines
            display: '-webkit-box',
            '-webkit-line-clamp': '2',
            '-webkit-box-orient': 'vertical',
          }"
        >
          {{ props.game.name }}
        </h2>
      </header>

      <div>
        <!-- Game Modes -->
        <div
          v-if="props.game.gameSubmissionGameModes?.length"
          class="game-card__game-modes"
        >
          {{
            props.game.gameSubmissionGameModes
              .map(mode => mode.gameMode.name)
              .join(", ")
          }}
        </div>

        <!-- Platform Groups -->
        <div
          v-if="props.game.platformGroups?.length"
          class="tw:mt-2"
        >
          <CrossPlayGameCardPlatformGroups
            role="listitem"
            :platform-groups="props.game.platformGroups"
          />
        </div>
      </div>
    </div>
  </article>
</template>
