<script setup lang="ts">
import { Icon } from "#components";
import { SUPPORTED_PC_STORES_BY_SLUG } from "~~/shared/constants";
import type { GameSubmission } from "~~/shared/types/submissions";

const props = defineProps<{
  game: GameSubmission;
}>();

const groupPlatformsWithPC = computed(() => {
  return (
    props.game.platformGroups?.find(group =>
      group.platformGroupPlatforms?.some(p => p.platform?.id === 6)
    )?.platformGroupPlatforms ?? []
  );
});

const sortedPCStores = computed(
  () =>
    props.game.pcStorePlatforms?.toSorted((a, b) =>
      a.storeSlug.localeCompare(b.storeSlug)
    ) ?? []
);

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
</script>

<template>
  <article class="game-card">
    <!-- Image Section -->
    <button class="game-card__cover">
      <NuxtImg
        :src="`https://images.igdb.com/igdb/image/upload/t_720p/${game.gameImageId}.jpg`"
        :alt="game.gameName"
        preload
        loading="lazy"
      />
    </button>

    <!-- Content Section -->
    <div class="game-card__content">
      <header>
        <h2 class="game-card__title">{{ game.gameName }}</h2>
      </header>

      <div class="sections">
        <!-- Platform Groups -->
        <div v-if="game.platformGroups?.length">
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
                  <span>Cross-play supported</span>
                </template>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
