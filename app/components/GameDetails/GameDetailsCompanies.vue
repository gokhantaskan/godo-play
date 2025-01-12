<script setup lang="ts">
import type { InvolvedCompany } from "~~/shared/types/igdb/gameDetails";

const props = defineProps<{
  companies: InvolvedCompany[];
  firstReleaseDate: number;
}>();

const publishers = toRef(() => {
  return props.companies
    .filter(company => company.publisher)
    .map(company => company.company.name)
    .join(", ");
});

const developers = toRef(() => {
  return props.companies
    .filter(company => company.developer)
    .map(company => company.company.name)
    .join(", ");
});

const humanDate = toRef(() => {
  if (!props.firstReleaseDate) return null;

  return Intl.DateTimeFormat(navigator.language || "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(props.firstReleaseDate * 1000));
});
</script>

<template>
  <div class="companies">
    <div class="companies__group companies__group--developer">
      <h3 class="companies__title">Developers</h3>
      <p class="companies__content">{{ developers }}</p>
    </div>
    <div class="companies__group companies__group--publisher">
      <h3 class="companies__title">Publishers</h3>
      <p class="companies__content">{{ publishers }}</p>
    </div>
    <div
      v-if="firstReleaseDate"
      class="companies__group companies__group--release-date"
    >
      <h3 class="companies__title">First release</h3>
      <p class="companies__content">{{ humanDate }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "sass:map";
@use "@/assets/styles/abstracts/variables" as *;

$breakpoint: map.get($breakpoints, "sm");

.companies {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;

  @media (min-width: $breakpoint) {
    grid-template-columns: repeat(auto-fit, minmax(0, auto));
    gap: 1rem;
  }
}

.companies__title {
  font-size: var(--subtitle-font-size, 1rem);
  font-weight: var(--subtitle-font-weight, 500);
  line-height: var(--subtitle-line-height, 1.125);
  color: var(--subtitle-color, inherit);
}

.companies__content {
  font-size: var(--content-font-size, 0.875rem);
  font-weight: var(--content-font-weight, 400);
  line-height: var(--content-line-height, 1);
  color: var(--content-color, inherit);
}
</style>
