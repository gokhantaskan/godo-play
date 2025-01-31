<script setup lang="ts">
import type { ConsolidatedPlatformGroupsProps } from "@/components/ConsolidatedPlatformGroups.vue";

export interface GameDetailsCrossplayInfoProps {
  gameName?: GameSubmissionWithRelations["name"];
  platformGroups: ConsolidatedPlatformGroupsProps["platformGroups"];
  storePlatforms: GameSubmissionWithRelations["storePlatforms"];
  crossplayInformation: GameSubmissionWithRelations["crossplayInformation"];
}

defineProps<GameDetailsCrossplayInfoProps>();
</script>

<template>
  <div class="tw:space-y-4">
    <section>
      <h2>Platforms</h2>
      <p class="tw:text-text-muted tw:text-sm tw:mb-2">
        Each platform group can cross-play with each other.
      </p>
      <!-- <div v-if="IS_DEV">{{ platformGroups }}</div> -->
      <CrossPlayGameDetailsPlatformGroups :platform-groups="platformGroups" />
    </section>
    <section>
      <header class="tw:flex tw:items-center tw:gap-1">
        <h2>Stores</h2>
        <!-- <TheInfoBubble
          content="While each store may cross-play with other versions on the same platform, it cannot play with versions in a different cross-play group."
        /> -->
      </header>
      <p class="tw:text-text-muted tw:text-sm tw:mb-2">
        While each store may cross-play with other versions on the same
        platform, it cannot play with versions in a different cross-play group.
      </p>
      <!-- <div v-if="IS_DEV">{{ storePlatforms }}</div> -->
      <CrossPlayGameDetailsStorePlatforms :store-platforms="storePlatforms" />
    </section>
    <section v-if="crossplayInformation">
      <h2>Can {{ gameName }} be cross-played?</h2>
      <!-- eslint-disable vue/no-v-html -->
      <blockquote
        v-if="crossplayInformation?.information"
        class="ProseMirror"
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
    </section>
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

  &__item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  &__link {
    color: var(--tw-color-primary);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
}
</style>
