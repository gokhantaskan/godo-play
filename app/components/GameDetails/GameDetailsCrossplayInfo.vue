<script setup lang="ts">
import type { ConsolidatedPlatformGroupsProps } from "@/components/ConsolidatedPlatformGroups.vue";

export interface GameDetailsCrossplayInfoProps {
  platformGroups: ConsolidatedPlatformGroupsProps["platformGroups"];
  crossplayInformation: GameSubmissionWithRelations["crossplayInformation"];
}

defineProps<GameDetailsCrossplayInfoProps>();
</script>

<template>
  <div>
    <ConsolidatedPlatformGroups :platform-groups="platformGroups">
      <template #default="{ platformGroups: _platformGroups }">
        <div class="crossplay-info__platforms">
          <h3 class="crossplay-info__title">Cross-play Groups</h3>
          <p class="crossplay-info__description">
            Each platform in the same group can cross-play with each other.
          </p>
          <dl class="crossplay-info__platforms-list">
            <template
              v-for="(group, index) in _platformGroups"
              :key="index"
            >
              <dt class="crossplay-info__group">
                <strong>{{ `#${index + 1}` }}</strong>
              </dt>
              <dd class="crossplay-info__items">
                <span
                  v-for="platform in group"
                  :key="platform.name"
                  class="crossplay-info__item"
                >
                  <Icon
                    class="crossplay-info__icon"
                    size="1.125rem"
                    :name="platform.icon"
                  />
                  {{ platform.name }}
                </span>
              </dd>
            </template>
          </dl>
        </div>
      </template>
    </ConsolidatedPlatformGroups>
    <div>
      <!-- eslint-disable vue/no-v-html -->
      <blockquote
        v-if="crossplayInformation?.information"
        class="crossplay-info__evidence"
        v-html="crossplayInformation.information"
      />
      <!-- eslint-enable vue/no-v-html -->
      <a
        v-if="crossplayInformation?.evidenceUrl"
        :href="crossplayInformation.evidenceUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="crossplay-info__link"
      >
        Learn more
        <Icon
          name="lucide:external-link"
          size="0.875em"
        />
      </a>
    </div>
  </div>
</template>

<style scoped lang="scss">
.crossplay-info {
  &__title {
    font-size: 1.25rem;
    font-weight: 500;
  }

  &__description {
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    color: var(--tw-color-text-muted);
  }

  &__platforms-list {
    display: grid;
    grid-template-columns: max-content auto;
    column-gap: 0.5rem;
    row-gap: 1rem;
  }

  &__items {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  &__evidence {
    margin-block: 1rem;
    border-inline-start: 2px solid var(--tw-color-border);
    padding-inline-start: 1rem;
  }

  &__link {
    color: var(--tw-color-primary);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
}
</style>
