<script setup lang="ts">
import { getSafeUrl, getWebsiteInfo } from "@/utils/url";
import type { GameDetails } from "~~/shared/types/igdb/gameDetails";

const props = withDefaults(
  defineProps<{
    websites: GameDetails["websites"];
    showLabel?: boolean;
  }>(),
  {
    showLabel: true,
  }
);

const websiteLinks = computed(() =>
  (
    props.websites
      ?.map(website => {
        const url = getSafeUrl(website.url);
        const info = getWebsiteInfo(website.url);

        if (import.meta.env.DEV) {
          console.log(`Website URL: ${url}, Info:`, info);
        }

        return {
          id: website.id,
          url,
          info,
        };
      })
      .filter(
        (
          link
        ): link is {
          id: number;
          url: string;
          info: NonNullable<ReturnType<typeof getWebsiteInfo>>;
        } => link.info !== undefined
      ) || []
  ).sort((a, b) => a.info.label.localeCompare(b.info.label))
);
</script>

<template>
  <div
    v-if="websiteLinks.length"
    class="game-details-websites"
  >
    <div
      v-for="link in websiteLinks"
      :key="link.id"
      class="game-details-websites__item"
    >
      <NuxtLink
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        class="game-details-websites__link"
      >
        <Icon
          :name="link.info.icon"
          class="game-details-websites__icon"
        />
        <span
          v-if="showLabel"
          class="game-details-websites__label"
        >
          {{ link.info.label }}
        </span>
      </NuxtLink>
    </div>
  </div>
</template>

<style>
.game-details-websites {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.game-details-websites__link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  color: color-mix(in oklab, var(--tw-color-primary) 75%, black);
  background-color: color-mix(
    in oklch,
    var(--tw-color-primary) 12%,
    transparent
  );
  text-decoration: none;
  font-size: 0.875rem;
}

.game-details-websites__icon {
  width: 1rem;
  height: 1rem;
}
</style>
