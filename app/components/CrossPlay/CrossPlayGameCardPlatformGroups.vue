<script setup lang="ts">
import { getConsolidatedPlatformGroups } from "@/utils/game";
import type { GameSubmissionWithRelations } from "~~/shared/types";

const props = withDefaults(
  defineProps<{
    platformGroups: GameSubmissionWithRelations["platformGroups"];
    showLabels?: boolean;
  }>(),
  {
    showLabels: false,
  }
);

const platformGroups = computed(() =>
  getConsolidatedPlatformGroups(props.platformGroups)
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
