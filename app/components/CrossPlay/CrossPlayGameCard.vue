<script setup lang="ts">
import { SUPPORTED_PC_STORES_BY_SLUG } from "~~/shared/constants";
import type { GameSubmissionWithRelations } from "~~/shared/types";

const props = defineProps<{
  game: GameSubmissionWithRelations;
}>();

const groupPlatformsWithPC = computed(() => {
  return (
    props.game.platformGroups?.find(group =>
      group.platformGroupPlatforms?.some(p => p.platform?.slug === "win")
    )?.platformGroupPlatforms ?? []
  );
});

const sortedPCStores = computed(
  () =>
    props.game.pcStorePlatforms?.toSorted((a, b) =>
      a.storeSlug.localeCompare(b.storeSlug)
    ) ?? []
);

// TODO: Work on this
// const isModalOpen = ref(false);
// const cacheKey = computed(() => `game-${props.game.gameId}`);
// const { data: cachedGameDetails } = useNuxtData(cacheKey.value);
// const {
//   data: gameDetails,
//   status: gameDetailsStatus,
//   execute: fetchGameDetails,
// } = useFetch(`/api/games/igdb/${props.game.slug}`, {
//   immediate: false,
//   key: cacheKey.value,
//   lazy: !!cachedGameDetails.value,
// });
// const pendingGameDetails = computed(() => {
//   return gameDetailsStatus.value === "pending";
// });

const getStoreName = (storeSlug: string) =>
  SUPPORTED_PC_STORES_BY_SLUG[storeSlug]?.name ?? storeSlug;

const getStoreIcon = (storeSlug: string) =>
  SUPPORTED_PC_STORES_BY_SLUG[storeSlug]?.icon ?? "lucide:store";

const hasCrossplaySupport = (crossplayLength: number) => {
  const platformsInGroup = groupPlatformsWithPC.value;
  // If there's only one platform (PC) in the group, return false
  if (!platformsInGroup || platformsInGroup.length <= 1) {
    return false;
  }
  // Check if the number of crossplay entries matches the number of other platforms
  return crossplayLength === platformsInGroup.length - 1;
};

// async function openModal() {
//   isModalOpen.value = true;
//   await fetchGameDetails();
// }
</script>

<template>
  <article class="game-card">
    <!-- Image Section -->
    <button class="game-card__cover">
      <NuxtImg
        :src="`https://images.igdb.com/igdb/image/upload/t_720p/${game.external?.igdbImageId}.jpg`"
        :alt="game.name"
        preload
        loading="lazy"
        :quality="80"
      />
    </button>

    <!-- Content Section -->
    <div class="game-card__content">
      <header>
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

        <!-- PC Stores -->
        <div
          v-if="game.pcStorePlatforms?.length"
          class="game-card__tags"
          aria-label="PC Stores"
        >
          <div
            class="tw:space-y-2"
            role="list"
          >
            <div
              v-for="store in sortedPCStores"
              :key="store.id"
              class="store-item"
              role="listitem"
            >
              <div class="tw:flex tw:items-center tw:gap-2">
                <Icon
                  :name="getStoreIcon(store.storeSlug)"
                  class="store-icon"
                  aria-hidden="true"
                />
                <span class="tw:text-sm tw:font-medium">
                  {{ getStoreName(store.storeSlug) }}
                </span>
              </div>
              <p
                class="tw:text-xs tw:text-text-muted tw:flex tw:items-center tw:gap-2"
              >
                <template
                  v-if="
                    hasCrossplaySupport(store.crossplayEntries?.length ?? 0)
                  "
                >
                  <Icon
                    name="fa6-solid:check"
                    class="tw:text-green"
                    aria-hidden="true"
                  />
                  <span>Cross-play supported</span>
                </template>
                <template v-else-if="store.crossplayEntries?.length">
                  <Icon
                    name="fa6-solid:circle-half-stroke"
                    class="tw:text-yellow"
                    aria-hidden="true"
                  />
                  <span>
                    Crossplay with
                    <strong class="platforms">
                      {{
                        store.crossplayEntries
                          .map(entry => entry.platform?.name)
                          .filter(Boolean)
                          .join(", ")
                      }}
                    </strong>
                  </span>
                </template>
                <template v-else>
                  <Icon
                    name="fa6-solid:xmark"
                    class="tw:text-red"
                    aria-hidden="true"
                  />
                  <span>Cross-play not supported</span>
                </template>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Details Modal -->
    <!-- <TheModal
      :key="game.gameId"
      v-model:open="isModalOpen"
      :title="game.gameName"
      max-width="48rem"
    >
      <GameDetails
        :details="gameDetails"
        :is-loading="!gameDetails && pendingGameDetails"
      />
    </TheModal> -->
  </article>
</template>
