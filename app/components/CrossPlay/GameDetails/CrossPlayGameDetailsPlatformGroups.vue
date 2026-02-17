<script setup lang="ts">
import type { GameWithRelations } from "~~/shared/types";

const props = defineProps<{
  platformGroups: GameWithRelations["platformGroups"];
}>();

const consolidatedPlatformGroups = computed(() => {
  return getConsolidatedPlatformGroups(props.platformGroups);
});
</script>

<template>
  <div class="group">
    <dl class="group__dl">
      <template
        v-for="(group, index) in consolidatedPlatformGroups"
        :key="index"
      >
        <dt class="group__dt">
          <strong>{{ `#${index + 1}` }}</strong>
        </dt>
        <dd class="group__dd">
          <span
            v-for="platform in group"
            :key="platform.name"
            class="group__item"
          >
            <Icon
              class="group__icon"
              :name="platform.icon"
            />
            {{ platform.name }}
          </span>
        </dd>
      </template>
    </dl>
  </div>
</template>

<style scoped lang="scss">
.group {
  --lh: 1.5;

  &__dl {
    display: grid;
    grid-template-columns: max-content auto;
    column-gap: 0.5rem;
    row-gap: 0.75rem;
  }

  &__dt {
    font-weight: 500;
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
