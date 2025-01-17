<script setup lang="ts">
import { autoCompletePt } from "@/utils/pt";
import type { DashboardGame } from "~~/shared/types/igdb/dashboardGames";

export interface GameOption {
  id: number;
  name: string;
  slug: string;
  imageId?: string;
}

const selectedGame = ref<GameOption | null>(null);
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

    const response = await $fetch<DashboardGame[]>("/api/games", {
      params: {
        search: query,
        limit: 100,
      },
    });

    games.value = response.map(game => ({
      id: game.id,
      name: game.name,
      slug: game.slug,
      imageId: game.cover?.image_id ?? "",
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
  <PAutoComplete
    v-model="selectedGame"
    :suggestions="games"
    :loading="isLoading"
    placeholder="Search for a game name..."
    option-label="name"
    :pt="autoCompletePt"
    :delay="500"
    required
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
          <div class="tw:text-sm tw:text-gray-500">
            {{ option.description }}
          </div>
        </div>
      </div>
    </template>
  </PAutoComplete>
</template>
