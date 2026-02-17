<script setup lang="ts">
import {
  PLATFORM_ICONS,
  SUPPORTED_PC_STORES_BY_SLUG,
} from "~~/shared/constants";
import type { GameWithRelations } from "~~/shared/types";

const props = defineProps<{
  storePlatforms: GameWithRelations["storePlatforms"];
}>();

const sortedStores = computed(
  () =>
    props.storePlatforms?.toSorted((a, b) =>
      a.store.slug.localeCompare(b.store.slug)
    ) ?? []
);

const getStoreName = (storeSlug: string) =>
  SUPPORTED_PC_STORES_BY_SLUG[storeSlug]?.name ?? storeSlug;

const getStoreIcon = (storeSlug: string) =>
  SUPPORTED_PC_STORES_BY_SLUG[storeSlug]?.icon ?? "lucide:store";

function getConsolidatedPlatforms(
  platforms: { platform: { id: number; name: string; slug: string } }[]
) {
  const platformsMap: Record<string, { icon: string; name: string }> = {};

  // Check for PlayStation consolidation
  const hasPS4 = platforms.some(({ platform }) => platform.slug === "ps4--1");
  const hasPS5 = platforms.some(({ platform }) => platform.slug === "ps5");

  if (hasPS4 && hasPS5) {
    platformsMap["ps"] = {
      icon: PLATFORM_ICONS["ps"] ?? "lucide:gamepad-2",
      name: "PlayStation",
    };
  } else {
    if (hasPS4) {
      platformsMap["ps4--1"] = {
        icon: PLATFORM_ICONS["ps4--1"] ?? "lucide:gamepad-2",
        name: "PlayStation 4",
      };
    }
    if (hasPS5) {
      platformsMap["ps5"] = {
        icon: PLATFORM_ICONS["ps5"] ?? "lucide:gamepad-2",
        name: "PlayStation 5",
      };
    }
  }

  // Check for Xbox consolidation
  const hasXboxOne = platforms.some(
    ({ platform }) => platform.slug === "xboxone"
  );
  const hasXboxSeriesX = platforms.some(
    ({ platform }) => platform.slug === "series-x-s"
  );

  if (hasXboxOne && hasXboxSeriesX) {
    platformsMap["xbox"] = {
      icon: PLATFORM_ICONS["xbox"] ?? "lucide:gamepad-2",
      name: "Xbox",
    };
  } else {
    if (hasXboxOne) {
      platformsMap["xboxone"] = {
        icon: PLATFORM_ICONS["xboxone"] ?? "lucide:gamepad-2",
        name: "Xbox One",
      };
    }
    if (hasXboxSeriesX) {
      platformsMap["series-x-s"] = {
        icon: PLATFORM_ICONS["series-x-s"] ?? "lucide:gamepad-2",
        name: "Xbox Series X|S",
      };
    }
  }

  // Add other platforms
  for (const { platform } of platforms) {
    if (["ps4--1", "ps5", "xboxone", "series-x-s"].includes(platform.slug)) {
      continue;
    }

    platformsMap[platform.slug] = {
      icon: PLATFORM_ICONS[platform.slug] ?? "lucide:gamepad-2",
      name: platform.name,
    };
  }

  return Object.entries(platformsMap).sort(([, a], [, b]) =>
    a.name.localeCompare(b.name)
  );
}
</script>

<template>
  <div class="group">
    <div>
      <dl class="group__dl">
        <template
          v-for="store in sortedStores"
          :key="store.id"
        >
          <TheTooltip :content="getStoreName(store.store.slug)">
            <dt class="group__dt">
              <Icon
                :name="getStoreIcon(store.store.slug)"
                class="group__icon"
              />
              <span class="tw:sr-only">{{
                getStoreName(store.store.slug)
              }}</span>
            </dt>
          </TheTooltip>
          <dd class="group__dd">
            Cross-play with:
            <template v-if="store.crossplayEntries?.length">
              <span
                v-for="[slug, platform] in getConsolidatedPlatforms(
                  store.crossplayEntries
                )"
                :key="slug"
                class="group__item"
              >
                <Icon
                  :name="platform.icon"
                  class="group__icon"
                />
                {{ platform.name }}
              </span>
            </template>
            <template v-else>
              <span>
                ❌
                <span class="tw:sr-only">None</span>
              </span>
            </template>
            <template v-if="store.storeUrl">
              <span> - </span>
              <NuxtLink
                :href="store.storeUrl"
                target="_blank"
                >link</NuxtLink
              >
            </template>
          </dd>
        </template>
      </dl>
    </div>
  </div>
</template>

<style scoped lang="scss">
.group {
  &__dl {
    --lh: 1.5;

    display: grid;
    grid-template-columns: max-content auto;
    column-gap: 0.5rem;
    row-gap: 0.75rem;
  }

  &__dt {
    inline-size: calc(var(--lh) * 1rem);
    block-size: calc(var(--lh) * 1rem);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__dd {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    line-height: var(--lh);
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  &__icon {
    size: 1rem;
  }
}
</style>
