<script setup lang="ts">
import igdbService from "@/lib/services/igdb.service";
import { autoCompletePt } from "@/utils/pt";
import type { DashboardGame } from "~~/shared/types/igdb/dashboardGames";

export interface GameOption {
  id: number;
  name: string;
  slug: string;
  platforms: DashboardGame["platforms"];
  gameModes: DashboardGame["game_modes"];
  imageId?: string;
  aggregated_rating?: number;
}

export type GameOptionOrString = GameOption | string | null;

const value = defineModel<GameOptionOrString>("modelValue", {
  required: true,
});

const isLoading = ref(false);
const games = ref<GameOption[]>([]);

async function searchGames(event: { query: string }) {
  const query = event.query;

  if (!query) {
    games.value = [];
    return;
  }

  try {
    isLoading.value = true;
    const response = await igdbService.searchGames(query);

    games.value = (response ?? []).map((game: DashboardGame) => ({
      id: game.id,
      name: game.name,
      slug: game.slug,
      platforms: game.platforms,
      gameModes: game.game_modes,
      imageId: game.cover?.image_id ?? "",
      aggregated_rating: game.aggregated_rating,
    }));
  } catch (error) {
    console.error("Error searching games:", error);
    games.value = [];
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-1">
    <label
      for="game-search"
      class="tw:font-medium"
      >Game</label
    >
    <PAutoComplete
      v-model="value"
      input-id="game-search"
      :suggestions="games"
      :loading="isLoading"
      placeholder="Search for a game name..."
      option-label="name"
      :pt="autoCompletePt"
      :delay="500"
      required
      force-selection
      @complete="searchGames"
    >
      <template #option="{ option }">
        <div class="tw:flex tw:items-center tw:gap-2">
          <div class="tw:size-8 tw:rounded tw:overflow-hidden tw:bg-border">
            <img
              v-if="option.imageId"
              :src="`https://images.igdb.com/igdb/image/upload/t_cover_small/${option.imageId}.jpg`"
              :alt="option.name"
              class="tw:w-8 tw:h-8 tw:object-cover"
            />
          </div>
          <div class="tw:flex-1">
            <div class="tw:font-medium">{{ option.name }}</div>
          </div>
        </div>
      </template>
    </PAutoComplete>
  </div>
</template>
