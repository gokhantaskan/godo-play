<script setup lang="ts">
import { Icon } from "#components";
import { SUPPORTED_PC_STORES_BY_SLUG } from "~~/shared/constants";
import type { GameSubmission } from "~~/shared/types/submissions";

const props = defineProps<{
  game: GameSubmission;
}>();

const groupPlatformsWithPC = computed(() => {
  return props.game.platformGroups?.find(group =>
    group.platformGroupPlatforms.some(p => p.platform.id === 6)
  )?.platformGroupPlatforms;
});

const sortedPCStores = computed(
  () =>
    props.game.pcStorePlatforms?.toSorted((a, b) =>
      a.storeSlug.localeCompare(b.storeSlug)
    ) ?? []
);

const getStoreName = (storeSlug: string) =>
  SUPPORTED_PC_STORES_BY_SLUG[storeSlug]?.name ?? "";
const getStoreIcon = (storeSlug: string) =>
  SUPPORTED_PC_STORES_BY_SLUG[storeSlug]?.icon ?? "";

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
  <article class="cross-play-card">
    <!-- Image Section -->
    <div class="cover">
      <NuxtImg
        :src="`https://images.igdb.com/igdb/image/upload/t_cover_big/${game.gameImageId}.jpg`"
        :alt="game.gameName"
        preload
        loading="lazy"
      />
    </div>

    <!-- Content Section -->
    <div class="content">
      <header>
        <h2 class="title">{{ game.gameName }}</h2>
      </header>

      <div class="sections">
        <!-- Platform Groups -->
        <div v-if="game.platformGroups?.length">
          <div
            class="platform-groups"
            role="list"
          >
            <template
              v-for="group in game.platformGroups"
              :key="group.id"
            >
              <CrossPlayGameCardPlatformGroup
                role="listitem"
                :platform-group="group"
              />
            </template>
          </div>
        </div>

        <!-- PC Stores -->
        <div
          v-if="game.pcStorePlatforms?.length"
          class="stores-section"
        >
          <h4 class="stores-title">PC Stores</h4>
          <div
            class="stores-list"
            role="list"
          >
            <div
              v-for="store in sortedPCStores"
              :key="store.id"
              class="store-item"
              role="listitem"
            >
              <div class="store-header">
                <Icon
                  :name="getStoreIcon(store.storeSlug)"
                  class="store-icon"
                  aria-hidden="true"
                />
                <span class="store-name">
                  {{ getStoreName(store.storeSlug) }}
                </span>
              </div>
              <p class="crossplay-info">
                <template
                  v-if="hasCrossplaySupport(store.crossplayEntries.length)"
                >
                  <Icon
                    name="fa6-solid:check"
                    class="tw:text-green"
                    aria-hidden="true"
                  />
                  <span>Crossplay within the group</span>
                </template>
                <template v-else-if="store.crossplayEntries.length">
                  <span>
                    Crossplay with
                    <strong class="platforms">
                      {{
                        store.crossplayEntries
                          .map(entry => entry.platform.name)
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
                  <span>Does not support crossplay</span>
                </template>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.cross-play-card {
  display: grid;
  grid-template-columns: clamp(96px, 25vw, 192px) 1fr;
  gap: 1rem;
  background-color: var(--tw-colors-gray-50);
  border-radius: 0.75rem;
  border: 1px solid var(--tw-colors-gray-200);
  padding: 1rem;

  .cover {
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    height: fit-content;
    aspect-ratio: 3/4;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .title {
    font-size: clamp(1.25rem, 2vw, 1.5rem);
    font-weight: 700;
    color: var(--tw-colors-gray-900);
  }

  .sections {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .platform-groups {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .stores-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .stores-title {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--tw-colors-gray-500);
  }

  .stores-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
    gap: 0.75rem;
  }

  .store-item {
    background: white;
    border: 1px solid var(--tw-color-border);
    border-radius: 0.5rem;
    padding: 0.5rem;
    height: 100%;
  }

  .store-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    line-height: 1.125;
  }

  .store-icon {
    width: 1rem;
    height: 1rem;
    color: var(--tw-colors-gray-700);
    flex-shrink: 0;
  }

  .store-name {
    font-weight: 500;
    color: var(--tw-colors-gray-900);
    font-size: 0.875rem;
  }

  .crossplay-info {
    font-size: 0.75rem;
    color: var(--tw-color-text-muted);
    margin-block-start: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .platforms {
    font-weight: 500;
  }
}
</style>
