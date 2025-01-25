<script setup lang="ts">
import type { Content } from "@prismicio/client";

const { slice } = defineProps(
  getSliceComponentProps<Content.HeroSectionSlice>([
    "slice",
    "index",
    "slices",
    "context",
  ])
);
</script>

<template>
  <header
    :data-slice-type="slice.slice_type"
    :data-slice-variation="slice.variation"
    class="hero"
    :class="{ 'hero--with-bg': slice.variation === 'withBgImage' }"
  >
    <div class="hero__content">
      <h1 class="hero__title">{{ slice.primary.title }}</h1>
      <p class="hero__description">{{ slice.primary.description }}</p>
      <NuxtLink
        v-slot="{ navigate }"
        to="/games"
        custom
      >
        <TheButton
          class="hero__cta"
          size="lg"
          right-icon="lucide:arrow-right"
          @click="navigate"
        >
          {{ slice.primary.cta_text }}
        </TheButton>
      </NuxtLink>
    </div>
  </header>
</template>

<style scoped lang="scss">
@use "sass:map";
@use "@/assets/styles/abstracts/variables" as *;

$breakpoint-md: map.get($breakpoints, "md");

.hero {
  padding-block: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &--with-bg {
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    color: var(--color-white);
  }

  &__content {
    text-align: center;
    max-width: 60ch;
    padding-inline: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  &__title {
    font-size: 2rem;
    line-height: 105%;
    margin-block-end: 24px;
    font-weight: 600;

    @media (min-width: $breakpoint-md) {
      font-size: 3rem;
    }
  }

  &__description {
    font-size: 1.125rem;
    line-height: 1.25;
    font-weight: 300;

    @media (min-width: $breakpoint-md) {
      font-size: 1.375rem;
    }
  }

  &__cta {
    margin-block-start: 16px;
  }
}
</style>
