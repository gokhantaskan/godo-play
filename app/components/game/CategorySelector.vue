<script setup lang="ts">
import { GAME_MODES } from "~~/shared/constants/gameModes";
import { GENRES } from "~~/shared/constants/genres";
import { PLAYER_PERSPECTIVES } from "~~/shared/constants/playerPerspectives";
import { THEMES } from "~~/shared/constants/themes";

const selectedGenres = defineModel<number[]>("genres", {
  default: [],
});

const selectedThemes = defineModel<number[]>("themes", {
  default: [],
});

const selectedGameModes = defineModel<number[]>("gameModes", {
  default: [],
});

const selectedPlayerPerspectives = defineModel<number[]>("playerPerspectives", {
  default: [],
});

const hasSelectedGenres = computed(() => selectedGenres.value.length > 0);
const hasSelectedThemes = computed(() => selectedThemes.value.length > 0);
const hasSelectedGameModes = computed(() => selectedGameModes.value.length > 0);
const hasSelectedPlayerPerspectives = computed(
  () => selectedPlayerPerspectives.value.length > 0
);

const selectedGenreNames = computed(() =>
  GENRES.filter(genre => selectedGenres.value.includes(genre.id))
);

const selectedThemeNames = computed(() =>
  THEMES.filter(theme => selectedThemes.value.includes(theme.id))
);

const selectedGameModeNames = computed(() =>
  GAME_MODES.filter(gameMode => selectedGameModes.value.includes(gameMode.id))
);

const selectedPlayerPerspectiveNames = computed(() =>
  PLAYER_PERSPECTIVES.filter(perspective =>
    selectedPlayerPerspectives.value.includes(perspective.id)
  )
);

const hasSelectedCategories = computed(
  () =>
    hasSelectedGenres.value ||
    hasSelectedThemes.value ||
    hasSelectedGameModes.value ||
    hasSelectedPlayerPerspectives.value
);

function clearAll() {
  if (
    selectedGenres.value.length > 0 ||
    selectedThemes.value.length > 0 ||
    selectedGameModes.value.length > 0 ||
    selectedPlayerPerspectives.value.length > 0
  ) {
    selectedGenres.value = [];
    selectedThemes.value = [];
    selectedGameModes.value = [];
    selectedPlayerPerspectives.value = [];
  }
}
</script>

<template>
  <details class="tw:space-y-2">
    <summary class="tw:font-title tw:font-medium tw:cursor-pointer">
      Categories
      {{
        hasSelectedCategories
          ? `(${selectedGenres.length + selectedThemes.length + selectedGameModes.length + selectedPlayerPerspectives.length} selected)`
          : ""
      }}
    </summary>
    <div class="tw:flex tw:flex-col tw:gap-2">
      <div class="tw:flex tw:gap-2">
        <button
          type="button"
          @click="clearAll"
        >
          Clear All
        </button>
      </div>
      <!-- Game Modes -->
      <fieldset class="tw:flex tw:flex-wrap tw:gap-2">
        <legend class="tw:font-title tw:font-medium tw:text-sm">
          Game Modes
        </legend>
        <label
          v-for="gameMode in GAME_MODES.toSorted((a, b) =>
            a.name.localeCompare(b.name)
          )"
          :key="gameMode.id"
          class="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer"
        >
          <input
            v-model="selectedGameModes"
            type="checkbox"
            :value="gameMode.id"
            class="tw:w-4 tw:h-4"
          />
          <span class="tw:text-sm">{{ gameMode.name }}</span>
        </label>
      </fieldset>
      <!-- Player Perspectives -->
      <fieldset class="tw:flex tw:flex-wrap tw:gap-2">
        <legend class="tw:font-title tw:font-medium tw:text-sm">
          Player Perspectives
        </legend>
        <label
          v-for="playerPerspective in PLAYER_PERSPECTIVES.toSorted((a, b) =>
            a.name.localeCompare(b.name)
          )"
          :key="playerPerspective.id"
          class="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer"
        >
          <input
            v-model="selectedPlayerPerspectives"
            type="checkbox"
            :value="playerPerspective.id"
            class="tw:w-4 tw:h-4"
          />
          <span class="tw:text-sm">{{ playerPerspective.name }}</span>
        </label>
      </fieldset>
      <!-- Genres -->
      <fieldset class="tw:flex tw:flex-wrap tw:gap-2">
        <legend class="tw:font-title tw:font-medium tw:text-sm">Genres</legend>
        <label
          v-for="genre in GENRES.toSorted((a, b) =>
            a.name.localeCompare(b.name)
          )"
          :key="genre.id"
          class="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer"
        >
          <input
            v-model="selectedGenres"
            type="checkbox"
            :value="genre.id"
            class="tw:w-4 tw:h-4"
          />
          <span class="tw:text-sm">{{ genre.name }}</span>
        </label>
      </fieldset>
      <!-- Themes -->
      <fieldset class="tw:flex tw:flex-wrap tw:gap-2">
        <legend class="tw:font-title tw:font-medium tw:text-sm">Themes</legend>
        <label
          v-for="theme in THEMES.toSorted((a, b) =>
            a.name.localeCompare(b.name)
          )"
          :key="theme.id"
          class="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer"
        >
          <input
            v-model="selectedThemes"
            type="checkbox"
            :value="theme.id"
            class="tw:w-4 tw:h-4"
          />
          <span class="tw:text-sm">{{ theme.name }}</span>
        </label>
      </fieldset>
    </div>
  </details>
  <div
    v-if="hasSelectedCategories"
    class="tw:flex tw:flex-wrap tw:gap-2 tw:mt-2"
    role="list"
  >
    <TheChip
      v-for="gameMode in selectedGameModeNames"
      :key="gameMode.id"
      removable
      :label="gameMode.name"
      role="listitem"
      @remove="
        selectedGameModes = selectedGameModes.filter(id => id !== gameMode.id)
      "
    />
    <TheChip
      v-for="perspective in selectedPlayerPerspectiveNames"
      :key="perspective.id"
      removable
      :label="perspective.name"
      variant="green"
      role="listitem"
      @remove="
        selectedPlayerPerspectives = selectedPlayerPerspectives.filter(
          id => id !== perspective.id
        )
      "
    />
    <TheChip
      v-for="genre in selectedGenreNames"
      :key="genre.id"
      removable
      :label="genre.name"
      variant="yellow"
      role="listitem"
      @remove="selectedGenres = selectedGenres.filter(id => id !== genre.id)"
    />
    <TheChip
      v-for="theme in selectedThemeNames"
      :key="theme.id"
      removable
      :label="theme.name"
      variant="red"
      role="listitem"
      @remove="selectedThemes = selectedThemes.filter(id => id !== theme.id)"
    />
  </div>
</template>
