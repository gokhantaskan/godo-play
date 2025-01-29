<script setup lang="ts">
import { getConsolidatedAgeRatings } from "@/utils/game";
import type { AgeRating } from "~~/shared/types/igdb/gameDetails";

export interface ConsolidatedAgeRatingProps {
  ageRatings: AgeRating[];
  visibleCategories?: number[];
}

const props = defineProps<ConsolidatedAgeRatingProps>();

const consolidatedRatings = computed(() =>
  getConsolidatedAgeRatings(props.ageRatings, props.visibleCategories)
);
</script>

<template>
  <slot :consolidated-ratings="consolidatedRatings" />
</template>
