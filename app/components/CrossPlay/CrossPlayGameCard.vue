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

function getPlatformName(platform: GameSubmissionPlatform): string {
  return platform.name;
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
  <div
    :style="{
      display: 'grid',
      gridAutoFlow: 'column',
      gridTemplateColumns: 'minmax(3rem, 5rem) 1fr',
      gap: '1rem',
    }"
  >
    <div class="tw:rounded tw:overflow-hidden tw:h-fit">
      <NuxtImg
        :src="`https://images.igdb.com/igdb/image/upload/t_cover_big/${game.gameImageId}.jpg`"
        :alt="game.gameName"
        preload
      />
    </div>

    <div>
      <header>
        <h2>{{ game.gameName }}</h2>
      </header>

      <div class="submission-card__sections">
        <div v-if="game.platformGroups?.length">
          <div
            role="list"
            class="tw:list-none tw:p-0 tw:flex tw:flex-wrap tw:gap-2"
          >
            <TheChip
              v-for="group in game.platformGroups"
              :key="group.id"
              role="listitem"
              size="md"
            >
              <span>
                {{
                  group.platformGroupPlatforms
                    .map(p => getPlatformName(p.platform))
                    .sort()
                    .join(", ")
                }}
              </span>
            </TheChip>
          </div>
        </div>

        <div v-if="game.pcStorePlatforms?.length">
          <h4>PC Stores</h4>
          <div role="list">
            <div
              v-for="store in game.pcStorePlatforms"
              :key="store.id"
              role="listitem"
              class="tw:mb-2 tw:last-of-type:mb-0"
            >
              <div class="tw:flex tw:items-center tw:gap-1 tw:leading-[1rem]">
                <Icon
                  :name="getStoreIcon(store.storeSlug)"
                  size="1rem"
                />
                <span class="tw:font-medium tw:inline-block tw:text-[1.125rem]">
                  {{ getStoreName(store.storeSlug) }}:
                </span>
              </div>
              <p
                class="tw:text-sm tw:[padding-inline-start:calc(1rem+var(--tw-spacing)*1)]"
              >
                {{
                  store.crossplayEntries
                    ?.map(entry => getPlatformName(entry.platform))
                    .join(", ") ?? "N/A"
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
