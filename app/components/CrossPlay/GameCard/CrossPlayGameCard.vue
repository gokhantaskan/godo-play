<script setup lang="ts">
import type { GameSubmissionWithRelations } from "~~/shared/types";

defineProps<{
  game: GameSubmissionWithRelations;
}>();
</script>

<template>
  <article class="game-card">
    <!-- Image Section -->
    <NuxtLink
      :to="{ name: 'CrossPlayGameDetailsPage', params: { slug: game.slug } }"
      target="_blank"
      class="game-card__cover"
    >
      <img
        :src="`https://images.igdb.com/igdb/image/upload/t_720p/${game.external?.igdbImageId}.jpg`"
        :alt="game.name"
        preload
        loading="lazy"
      />
    </NuxtLink>

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
  </article>
</template>
