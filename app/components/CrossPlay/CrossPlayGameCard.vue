<script setup lang="ts">
import { Icon } from "#components";
import { SUPPORTED_PC_STORES } from "~~/shared/constants";
import type {
  GameSubmission,
  GameSubmissionPlatform,
} from "~~/shared/types/submissions";

defineProps<{
  game: GameSubmission;
}>();

function getPlatformGroupName(platforms: GameSubmissionPlatform[]): string[] {
  const result: string[] = [];
  const platformNames = platforms.map(p => p.name);

  // Handle PlayStation platforms
  const hasPS4 = platformNames.includes("PlayStation 4");
  const hasPS5 = platformNames.includes("PlayStation 5");
  if (hasPS4 && hasPS5) {
    result.push("PlayStation");
  } else if (hasPS4) {
    result.push("PlayStation");
  } else if (hasPS5) {
    result.push("PlayStation 5");
  }

  // Handle Xbox platforms
  const hasXboxOne = platformNames.includes("Xbox One");
  const hasXboxSeries = platformNames.includes("Xbox Series X|S");
  if (hasXboxOne && hasXboxSeries) {
    result.push("Xbox");
  } else if (hasXboxOne) {
    result.push("Xbox");
  } else if (hasXboxSeries) {
    result.push("Xbox Series X|S");
  }

  // Add other platforms
  platforms.forEach(platform => {
    if (
      !platform.name.includes("PlayStation") &&
      !platform.name.includes("Xbox")
    ) {
      result.push(platform.name);
    }
  });

  return result;
}

function getStoreName(storeSlug: string): string {
  return (
    SUPPORTED_PC_STORES.find(store => store.slug === storeSlug)?.label ?? ""
  );
}

function getStoreIcon(storeSlug: string): string {
  return (
    SUPPORTED_PC_STORES.find(store => store.slug === storeSlug)?.icon ?? ""
  );
}
</script>

<template>
  <div class="cross-play-card">
    <!-- Image Section -->
    <div class="cover">
      <NuxtImg
        :src="`https://images.igdb.com/igdb/image/upload/t_cover_big/${game.gameImageId}.jpg`"
        :alt="game.gameName"
        preload
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
          <div class="platform-groups">
            <div
              v-for="group in game.platformGroups"
              :key="group.id"
              role="listitem"
              class="platform-group"
            >
              <span>
                {{
                  getPlatformGroupName(
                    group.platformGroupPlatforms.map(p => p.platform)
                  )
                    .sort()
                    .join(", ")
                }}
              </span>
            </div>
          </div>
        </div>

        <!-- PC Stores -->
        <div
          v-if="game.pcStorePlatforms?.length"
          class="stores-section"
        >
          <h4 class="stores-title">PC Stores</h4>
          <div class="stores-list">
            <div
              v-for="store in game.pcStorePlatforms"
              :key="store.id"
              class="store-item"
            >
              <div class="store-header">
                <Icon
                  :name="getStoreIcon(store.storeSlug)"
                  class="store-icon"
                />
                <span class="store-name">
                  {{ getStoreName(store.storeSlug) }}
                </span>
              </div>
              <p class="crossplay-info">
                <template v-if="store.crossplayEntries?.length">
                  Crossplay with:
                  <span class="platforms">
                    {{
                      getPlatformGroupName(
                        store.crossplayEntries?.map(entry => entry.platform) ??
                          []
                      ).join(", ") ?? "N/A"
                    }}
                  </span>
                </template>
                <template v-else>
                  <div class="tw:flex tw:items-center tw:gap-1">
                    <Icon
                      name="heroicons:x-mark"
                      class="tw:text-red"
                    />
                    Does not support crossplay
                  </div>
                </template>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cross-play-card {
  display: grid;
  grid-template-columns: clamp(96px, 25vw, 192px) 1fr;
  gap: 1.5rem;
  padding: 1rem;
  background-color: var(--tw-colors-gray-50);
  border-radius: 0.75rem;
  border: 1px solid var(--tw-colors-gray-200);

  .cover {
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    height: fit-content;

    img {
      width: 100%;
      height: auto;
      object-fit: cover;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .title {
    font-size: 1.5rem;
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

  .platform-group {
    background: white;
    border: 1px dashed var(--tw-color-border);
    border-radius: var(--tw-radius-md);
    padding: 0.375rem 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--tw-colors-gray-700);
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
    border: 1px solid var(--tw-color-gray-200);
    border-radius: 0.5rem;
    padding: 0.75rem;
    height: 100%;
  }

  .store-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .store-icon {
    width: 1.25rem;
    height: 1.25rem;
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
    color: var(--tw-colors-gray-600);
    margin-block-start: 0.5rem;
  }

  .platforms {
    font-weight: 500;
  }
}
</style>
