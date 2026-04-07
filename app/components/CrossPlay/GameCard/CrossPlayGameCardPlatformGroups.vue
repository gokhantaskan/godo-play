<script setup lang="ts">
import { getConsolidatedPlatformGroups } from "@/utils/game";
import type { GameWithRelations } from "~~/shared/types";

const { platformGroups: rawPlatformGroups } = defineProps<{
  platformGroups: GameWithRelations["platformGroups"];
  showLabels?: boolean;
}>();

const platformGroups = computed(() =>
  getConsolidatedPlatformGroups(rawPlatformGroups)
);
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
        v-for="(platform, _slug) in group"
        :key="_slug"
      >
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
            <span
              class="platform-group__name"
              :class="[
                {
                  'tw:sr-only': !showLabels,
                },
              ]"
              >{{ platform.name }}</span
            >
          </div>
        </TheTooltip>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.platform-groups {
  --gap: 0.375rem;

  display: flex;
  flex-wrap: wrap;
  gap: var(--gap);
}

.platform-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap);
  background: var(--tw-color-surface-container-high);
  border: 1px solid var(--tw-color-outline-variant);
  border-radius: var(--tw-radius-sm);
  padding: var(--gap);
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1.2;

  &__item {
    display: flex;
    align-items: center;
    gap: var(--gap);
  }

  &__icon {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  &__name {
    flex-grow: 1;
  }
}
</style>
