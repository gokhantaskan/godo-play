<script setup lang="ts">
import { AgeRatingCategories, AgeRatingRatings } from "~~/shared/constants";
import type { AgeRating } from "~~/shared/types/igdb/gameDetails";

const VISIBLE_CATEGORIES = [2]; // PEGI category constant

const props = defineProps<{
  ageRatings: AgeRating[];
}>();

const ratingsByCategory = computed(() => {
  const grouped = Object.groupBy(
    props.ageRatings.filter(rating =>
      VISIBLE_CATEGORIES.includes(rating.category)
    ),
    rating => rating.category
  );
  return Object.entries(grouped).map(([category, ratings]) => ({
    category: Number(category),
    ratings: (ratings as AgeRating[]).sort((a, b) => a.rating - b.rating),
  }));
});

function getRatingLabel(rating: number) {
  return Object.entries(AgeRatingRatings).find(
    ([, value]) => value === rating
  )?.[0];
}

function getRatingImagePath(rating: number) {
  const label = getRatingLabel(rating);
  return label ? `/age-ratings/PEGI/${label}.png` : "";
}

function getCategoryLabel(category: number) {
  return Object.entries(AgeRatingCategories).find(
    ([, value]) => value === category
  )?.[0];
}
</script>

<template>
  <div class="age-ratings">
    <template
      v-for="group in ratingsByCategory"
      :key="group.category"
    >
      <div class="age-ratings__group">
        <div class="age-ratings__category">
          {{ getCategoryLabel(group.category) }}
        </div>
        <div class="age-ratings__ratings">
          <img
            v-for="rating in group.ratings"
            :key="rating.id"
            :src="getRatingImagePath(rating.rating)"
            :alt="`PEGI ${getRatingLabel(rating.rating)}`"
            class="age-ratings__rating"
            width="32"
            height="32"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.age-ratings {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;

  &__group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__category {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--tw-color-text-muted);
  }

  &__ratings {
    display: flex;
    gap: 0.5rem;
  }

  &__rating {
    width: 2rem;
    height: 2rem;
    object-fit: contain;
  }
}
</style>
