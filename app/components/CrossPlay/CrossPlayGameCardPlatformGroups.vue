<script setup lang="ts">
import { PLATFORM_ICONS } from "~~/shared/constants";
import type { GameSubmissionPlatformGroup } from "~~/shared/types/submissions";

const props = defineProps<{
  platformGroups: GameSubmissionPlatformGroup[];
}>();

interface PlatformInfo {
  icon: string;
  name: string;
}

const platformGroups = computed(() => {
  const isSingleGroup = props.platformGroups.length === 1;

  const groupsWithPlatforms = props.platformGroups.map(group => {
    const groupResult: Record<string, PlatformInfo> = {};

    // Handle PlayStation consolidation
    const groupHasPS4 = group.platformGroupPlatforms.some(
      ({ platform }) => platform.slug === "ps4--1"
    );
    const groupHasPS5 = group.platformGroupPlatforms.some(
      ({ platform }) => platform.slug === "ps5"
    );

    // Consolidate PlayStation if it's a single group or both consoles are present
    if ((isSingleGroup && groupHasPS4) || (groupHasPS4 && groupHasPS5)) {
      groupResult["ps"] = {
        icon: PLATFORM_ICONS["ps"] ?? "",
        name: "PlayStation",
      };
    } else {
      if (groupHasPS4) {
        groupResult["ps4--1"] = {
          icon: PLATFORM_ICONS["ps4--1"] ?? "",
          name: "PlayStation 4",
        };
      }
      if (groupHasPS5) {
        groupResult["ps5"] = {
          icon: PLATFORM_ICONS["ps5"] ?? "",
          name: "PlayStation 5",
        };
      }
    }

    // Handle Xbox consolidation
    const groupHasXboxOne = group.platformGroupPlatforms.some(
      ({ platform }) => platform.slug === "xboxone"
    );
    const groupHasXboxSeriesX = group.platformGroupPlatforms.some(
      ({ platform }) => platform.slug === "series-x-s"
    );

    // Consolidate Xbox if it's a single group or both consoles are present
    if (
      (isSingleGroup && groupHasXboxOne) ||
      (groupHasXboxOne && groupHasXboxSeriesX)
    ) {
      groupResult["xbox"] = {
        icon: PLATFORM_ICONS["xbox"] ?? "",
        name: "Xbox",
      };
    } else {
      if (groupHasXboxOne) {
        groupResult["xboxone"] = {
          icon: PLATFORM_ICONS["xboxone"] ?? "",
          name: "Xbox One",
        };
      }
      if (groupHasXboxSeriesX) {
        groupResult["series-x-s"] = {
          icon: PLATFORM_ICONS["series-x-s"] ?? "",
          name: "Xbox Series X|S",
        };
      }
    }

    // Add all other platforms
    for (const { platform } of group.platformGroupPlatforms) {
      const slug = platform.slug;
      // Skip PlayStation and Xbox platforms as they're handled above
      if (["ps4--1", "ps5", "xboxone", "series-x-s"].includes(slug)) {
        continue;
      }

      groupResult[slug] = {
        icon: PLATFORM_ICONS[slug] ?? "",
        name: platform.name,
      };
    }

    // Sort platforms by name within each group
    return {
      platforms: Object.fromEntries(
        Object.entries(groupResult).sort(([, a], [, b]) =>
          a.name.localeCompare(b.name)
        )
      ),
      count: Object.keys(groupResult).length,
    };
  });

  // Sort groups by platform count (descending)
  return groupsWithPlatforms
    .sort((a, b) => b.count - a.count)
    .map(group => group.platforms);
});
</script>

<template>
  <div
    class="platform-groups"
    role="list"
  >
    <div
      v-for="(group, index) in platformGroups"
      :key="index"
      class="platform-group"
      role="listitem"
    >
      <template
        v-for="(platform, slug) in group"
        :key="slug"
      >
        <span class="platform-group__name tw:sr-only">{{ platform.name }}</span>
        <TheTooltip
          :content="platform.name"
          trigger="hover"
        >
          <div class="platform-group__item">
            <Icon
              :name="platform.icon"
              class="platform-group__icon"
              aria-hidden="true"
            />
          </div>
        </TheTooltip>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.platform-groups {
  --gap: 0.25rem;

  display: flex;
  flex-wrap: wrap;
  gap: var(--gap);
}

.platform-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap);
  background: white;
  border: 1px solid var(--tw-color-border);
  border-radius: var(--tw-radius-sm);
  padding: var(--gap);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.125;

  &__item {
    display: flex;
    align-items: center;
    gap: var(--gap);

    & + & {
      margin-inline-start: var(--gap);
      position: relative;

      &::before {
        content: "+";
        margin-inline-end: var(--gap);
        color: var(--tw-color-text-muted);
      }
    }
  }

  &__icon {
    width: calc(var(--gap) * 4);
    height: calc(var(--gap) * 4);
    flex-shrink: 0;
  }

  &__name {
    flex-grow: 1;
  }
}
</style>
