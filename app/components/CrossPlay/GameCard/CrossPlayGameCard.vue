<script setup lang="ts">
import type { GameSubmissionWithRelations } from "~~/shared/types";

const props = defineProps<{
  game: GameSubmissionWithRelations;
}>();

const {
  proxy: { clarity },
} = useClarityScript();

const isDialogOpen = ref(false);
const originalURL = ref("");

function openDialog(event: Event) {
  event.preventDefault();
  event.stopPropagation();

  // Track game click with Clarity
  clarity("set", "gameCardClicked", props.game.name);

  originalURL.value = window.location.href;
  history.pushState({ dialogOpen: true }, "", `/games/${props.game.slug}`);
  isDialogOpen.value = true;
  return false;
}

onMounted(() => {
  window.addEventListener("popstate", event => {
    if (event.state?.dialogOpen === undefined) {
      isDialogOpen.value = false;
    }
  });
});

onUnmounted(() => {
  window.removeEventListener("popstate", () => {});
});
</script>

<template>
  <article class="game-card">
    <!-- Image Section -->
    <a
      :href="`/games/${game.slug}`"
      class="game-card__cover"
      @click="openDialog"
    >
      <img
        :src="`https://images.igdb.com/igdb/image/upload/t_720p/${game.external?.igdbImageId}.jpg`"
        :alt="game.name"
        preload
        loading="lazy"
      />

      <!-- Official Doc Badge -->
      <span
        v-if="game.crossplayInformation?.isOfficial"
        class="game-card__official-doc-badge"
      >
        <Icon
          name="local:badge-check"
          class="game-card__official-doc-badge-icon"
        />
      </span>
    </a>

    <CrossPlayGameCardDialog
      v-model:open="isDialogOpen"
      :slug="game.slug"
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

        <!-- Tags -->
        <div
          v-if="props.game.tags?.length"
          class="tw:mt-2 tw:flex tw:flex-wrap tw:gap-1"
        >
          <TheChip
            v-for="tagItem in props.game.tags"
            :key="tagItem.tagId"
            :label="tagItem.tag.name"
            variant="primary"
            size="sm"
          />
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
