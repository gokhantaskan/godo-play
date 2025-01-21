<script setup lang="ts">
import { autoCompletePt } from "@/utils/pt";
import type { DashboardGame } from "~~/shared/types/igdb/dashboardGames";

export interface GameOption {
  id: number;
  name: string;
  slug: string;
  platforms: DashboardGame["platforms"];
  gameModes: DashboardGame["game_modes"];
  imageId?: string;
}

export type GameOptionOrString = GameOption | string | null;

export interface SubmitGameAutocompleteProps {
  modelValue: GameOptionOrString;
}

const props = defineProps<SubmitGameAutocompleteProps>();

const selectedGame = ref<GameOptionOrString>(props.modelValue);
const isLoading = ref(false);
const games = ref<GameOption[]>([]);

const emit = defineEmits<{
  (e: "update:modelValue", value: GameOptionOrString): void;
}>();

const value = computed({
  get: () => selectedGame.value,
  set: value => emit("update:modelValue", value),
});

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
      platforms: game.platforms,
      gameModes: game.game_modes,
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
  <label for="game-search">
    <span class="tw:font-medium">Game</span>
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
            <div class="tw:text-sm tw:text-gray-500">
              {{ option.description }}
            </div>
          </div>
        </div>
      </template>
    </PAutoComplete>
  </label>
</template>
