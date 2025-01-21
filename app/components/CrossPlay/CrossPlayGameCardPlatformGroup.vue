<script setup lang="ts">
import { SUPPORTED_PLATFORMS_BY_ID } from "~~/shared/constants";
import type { GameSubmissionPlatformGroup } from "~~/shared/types/submissions";

const props = defineProps<{
  platformGroup: GameSubmissionPlatformGroup;
}>();

const platforms = computed(() => props.platformGroup.platformGroupPlatforms);
const platformNames = computed(() => platforms.value.map(p => p.platform.name));
const hasPS4 = computed(() => platformNames.value.includes("PlayStation 4"));
const hasPS5 = computed(() => platformNames.value.includes("PlayStation 5"));
const hasXboxOne = computed(() => platformNames.value.includes("Xbox One"));
const hasXboxSeries = computed(() =>
  platformNames.value.includes("Xbox Series S|X")
);

const groupedPlatforms = computed(() => {
  const result: string[] = [];

  // Handle PlayStation platforms
  if (hasPS4.value && hasPS5.value) {
    result.push("PlayStation");
  } else if (hasPS4.value) {
    result.push("PlayStation 4");
  } else if (hasPS5.value) {
    result.push("PlayStation 5");
  }

  // Handle Xbox platforms
  if (hasXboxOne.value && hasXboxSeries.value) {
    result.push("Xbox");
  } else if (hasXboxOne.value) {
    result.push("Xbox One");
  } else if (hasXboxSeries.value) {
    result.push("Xbox Series S|X");
  }

  // Add other platforms
  platforms.value.forEach(({ platform }) => {
    if (
      !platform.name.includes("PlayStation") &&
      !platform.name.includes("Xbox") &&
      !result.includes(platform.name)
    ) {
      result.push(platform.name);
    }
  });

  return result.toSorted();
});

const platformIconMap = computed(() => {
  const map = new Map<string, number>();

  platforms.value.forEach(({ platform }) => {
    if (platform.name === "PlayStation 5") {
      map.set("PlayStation", platform.id);
      map.set("PlayStation 5", platform.id);
    } else if (platform.name === "Xbox Series S|X") {
      map.set("Xbox", platform.id);
      map.set("Xbox Series S|X", platform.id);
    } else {
      map.set(platform.name, platform.id);
    }
  });

  return map;
});
</script>

<template>
  <div
    class="platform-group"
    role="group"
  >
    <div
      v-for="platformName in groupedPlatforms"
      :key="platformName"
      class="platform-group__item"
    >
      <Icon
        :name="
          SUPPORTED_PLATFORMS_BY_ID[platformIconMap.get(platformName) ?? 0]
            ?.icon ?? ''
        "
        class="platform-group__icon"
        aria-hidden="true"
      />
      <span>{{ platformName }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.platform-group {
  --gap: 0.5rem;
  --group-spacing: calc(var(--gap) / 1.5);

  display: flex;
  flex-wrap: wrap;
  gap: var(--gap);
  background: white;
  border: 1px solid var(--tw-color-border);
  border-radius: var(--tw-radius-md);
  padding: calc(var(--gap) / 1.25) var(--gap);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.125;

  &__item {
    display: flex;
    align-items: center;
    gap: var(--group-spacing);

    & + & {
      margin-inline-start: var(--group-spacing);
      position: relative;

      &::before {
        content: "+";
        margin-inline-end: var(--group-spacing);
        color: var(--tw-color-text-muted);
      }
    }
  }

  &__icon {
    width: 1lh;
    height: 1lh;
    flex-shrink: 0;
  }
}
</style>
