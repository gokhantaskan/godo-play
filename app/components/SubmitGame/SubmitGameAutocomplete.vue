<script setup lang="ts">
import { watchDebounced } from "@vueuse/core";
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxViewport,
} from "reka-ui";

import igdbService from "@/lib/services/igdb.service";
import type { DashboardGame } from "~~/shared/types/igdb/dashboardGames";

export interface GameOption {
  id: number;
  name: string;
  slug: string;
  platforms: DashboardGame["platforms"];
  gameModes: DashboardGame["game_modes"];
  imageId?: string;
  aggregatedRating?: number;
  category: number;
  firstReleaseDate?: number;
}

export type GameOptionOrString = GameOption | string | null | undefined;

const value = defineModel<GameOptionOrString>("modelValue", {
  required: true,
});

const isLoading = ref(false);
const games = ref<GameOption[]>([]);
const searchTerm = ref<string>("");
const error = ref<string | null>(null);

async function searchGames(query: string) {
  if (!query) {
    games.value = [];
    error.value = null;
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;
    const response = await igdbService.searchGames(query);

    games.value = (response ?? []).map((game: DashboardGame) => ({
      id: game.id,
      name: game.name,
      slug: game.slug,
      platforms: game.platforms,
      gameModes: game.game_modes,
      imageId: game.cover?.image_id ?? "",
      aggregatedRating: game.aggregated_rating,
      category: game.category,
      firstReleaseDate: game.first_release_date,
    }));
  } catch (err: unknown) {
    console.error("Error searching games:", err);
    games.value = [];
    error.value = "Failed to search games. Please try again.";
  } finally {
    isLoading.value = false;
  }
}

// Watch for changes in searchTerm to trigger the search
watchDebounced(
  searchTerm,
  newValue => {
    if (newValue) {
      searchGames(newValue.toString());
    } else {
      games.value = [];
      error.value = null;
    }
  },
  { debounce: 500 }
);
</script>

<template>
  <div class="combobox">
    <label
      for="game-search"
      class="combobox__label"
      >Game</label
    >
    <ComboboxRoot
      :model-value="value ?? undefined"
      :display-value="
        (option: GameOptionOrString) =>
          typeof option === 'object' && option ? option.name : ''
      "
      :ignore-filter="true"
      @update:model-value="newVal => (value = newVal)"
    >
      <ComboboxAnchor class="combobox__anchor">
        <ComboboxInput
          id="game-search"
          v-model="searchTerm"
          class="combobox__input"
          placeholder="Search for a game name..."
          required
        />
        <div
          v-if="isLoading"
          class="combobox__spinner"
        >
          <div class="combobox__spinner-icon"></div>
        </div>
      </ComboboxAnchor>

      <ComboboxPortal>
        <ComboboxContent
          class="combobox__content"
          :position="'popper'"
          :side-offset="5"
          :align="'start'"
        >
          <ComboboxViewport class="combobox__viewport">
            <div
              v-if="isLoading && games.length === 0"
              class="combobox__message combobox__empty"
            >
              Searching games...
            </div>
            <div
              v-else-if="error"
              class="combobox__message combobox__error"
            >
              {{ error }}
            </div>
            <div
              v-else-if="!searchTerm"
              class="combobox__message combobox__empty"
            >
              Type to search for games...
            </div>
            <div
              v-else-if="games.length === 0"
              class="combobox__message combobox__empty"
            >
              No games found
            </div>
            <ComboboxItem
              v-for="game in games"
              :key="game.id"
              :value="game"
              class="combobox__item"
            >
              <div class="combobox__item-content">
                <div class="combobox__item-image">
                  <img
                    v-if="game.imageId"
                    :src="`https://images.igdb.com/igdb/image/upload/t_cover_small/${game.imageId}.jpg`"
                    :alt="game.name"
                  />
                </div>
                <div class="combobox__item-info">
                  <div class="combobox__item-info-title">{{ game.name }}</div>
                  <div
                    v-if="game.firstReleaseDate"
                    class="combobox__item-info-year"
                  >
                    {{ new Date(game.firstReleaseDate * 1000).getFullYear() }}
                  </div>
                </div>
              </div>
            </ComboboxItem>
          </ComboboxViewport>
        </ComboboxContent>
      </ComboboxPortal>
    </ComboboxRoot>
  </div>
</template>

<!-- Styles are now imported from app/assets/styles/components/_combobox.scss -->
