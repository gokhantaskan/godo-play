<script setup lang="ts">
import { GAME_MODES } from "~~/shared/constants/gameModes";
import { GENRES } from "~~/shared/constants/genres";
import { PLAYER_PERSPECTIVES } from "~~/shared/constants/playerPerspectives";
import { THEMES } from "~~/shared/constants/themes";

const isDrawerOpen = ref(false);

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

// Draft states
const draftGenres = ref<number[]>([]);
const draftThemes = ref<number[]>([]);
const draftGameModes = ref<number[]>([]);
const draftPlayerPerspectives = ref<number[]>([]);

// Initialize draft states when drawer opens
watch(isDrawerOpen, newValue => {
  if (newValue) {
    draftGenres.value = [...selectedGenres.value];
    draftThemes.value = [...selectedThemes.value];
    draftGameModes.value = [...selectedGameModes.value];
    draftPlayerPerspectives.value = [...selectedPlayerPerspectives.value];
  }
});

// const hasSelectedGenres = computed(() => selectedGenres.value.length > 0);
// const hasSelectedThemes = computed(() => selectedThemes.value.length > 0);
// const hasSelectedGameModes = computed(() => selectedGameModes.value.length > 0);
// const hasSelectedPlayerPerspectives = computed(
//   () => selectedPlayerPerspectives.value.length > 0
// );

// const hasSelectedCategories = computed(
//   () =>
//     hasSelectedGenres.value ||
//     hasSelectedThemes.value ||
//     hasSelectedGameModes.value ||
//     hasSelectedPlayerPerspectives.value
// );

// const totalSelectedCount = computed(
//   () =>
//     selectedGenres.value.length +
//     selectedThemes.value.length +
//     selectedGameModes.value.length +
//     selectedPlayerPerspectives.value.length
// );

// Draft computeds
const hasDraftChanges = computed(() => {
  return (
    !isArrayEqual(draftGenres.value, selectedGenres.value) ||
    !isArrayEqual(draftThemes.value, selectedThemes.value) ||
    !isArrayEqual(draftGameModes.value, selectedGameModes.value) ||
    !isArrayEqual(
      draftPlayerPerspectives.value,
      selectedPlayerPerspectives.value
    )
  );
});

const hasDraftSelections = computed(
  () =>
    draftGenres.value.length > 0 ||
    draftThemes.value.length > 0 ||
    draftGameModes.value.length > 0 ||
    draftPlayerPerspectives.value.length > 0
);

const totalDraftCount = computed(
  () =>
    draftGenres.value.length +
    draftThemes.value.length +
    draftGameModes.value.length +
    draftPlayerPerspectives.value.length
);

function clearAll() {
  draftGenres.value = [];
  draftThemes.value = [];
  draftGameModes.value = [];
  draftPlayerPerspectives.value = [];
}

function applyChanges() {
  selectedGenres.value = [...draftGenres.value];
  selectedThemes.value = [...draftThemes.value];
  selectedGameModes.value = [...draftGameModes.value];
  selectedPlayerPerspectives.value = [...draftPlayerPerspectives.value];
  isDrawerOpen.value = false;
}

const handleBeforeClose = (done: (cancel?: boolean) => void) => {
  if (hasDraftChanges.value) {
    if (confirm("You have unsaved changes. Are you sure you want to close?")) {
      done();
      return;
    }
  }

  done();
};

// Helper function to compare arrays
function isArrayEqual(arr1: number[], arr2: number[]) {
  return arr1.length === arr2.length && arr1.every(item => arr2.includes(item));
}
</script>

<template>
  <div class="tw:space-y-2">
    <TheButton
      variant="secondary"
      left-icon="lucide:filter"
      class="tw:font-title tw:font-medium"
      @click="isDrawerOpen = true"
    >
      <span class="tw:sr-only">Filters</span>
    </TheButton>

    <TheDrawer
      v-model:open="isDrawerOpen"
      :before-close="handleBeforeClose"
      title="Categories"
      size="30rem"
      :description="
        hasDraftSelections
          ? `${totalDraftCount} ${totalDraftCount === 1 ? 'category' : 'categories'} selected`
          : 'Select categories to filter games'
      "
    >
      <div class="tw:space-y-6">
        <!-- Game Modes -->
        <fieldset class="tw:flex tw:flex-wrap tw:gap-2">
          <legend class="tw:font-title tw:font-medium tw:text-sm tw:mb-2">
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
              v-model="draftGameModes"
              type="checkbox"
              :value="gameMode.id"
              class="tw:w-4 tw:h-4"
            />
            <span class="tw:text-sm">{{ gameMode.name }}</span>
          </label>
        </fieldset>

        <!-- Player Perspectives -->
        <fieldset class="tw:flex tw:flex-wrap tw:gap-2">
          <legend class="tw:font-title tw:font-medium tw:text-sm tw:mb-2">
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
              v-model="draftPlayerPerspectives"
              type="checkbox"
              :value="playerPerspective.id"
              class="tw:w-4 tw:h-4"
            />
            <span class="tw:text-sm">{{ playerPerspective.name }}</span>
          </label>
        </fieldset>

        <!-- Genres -->
        <fieldset class="tw:flex tw:flex-wrap tw:gap-2">
          <legend class="tw:font-title tw:font-medium tw:text-sm tw:mb-2">
            Genres
          </legend>
          <label
            v-for="genre in GENRES.toSorted((a, b) =>
              a.name.localeCompare(b.name)
            )"
            :key="genre.id"
            class="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer"
          >
            <input
              v-model="draftGenres"
              type="checkbox"
              :value="genre.id"
              class="tw:w-4 tw:h-4"
            />
            <span class="tw:text-sm">{{ genre.name }}</span>
          </label>
        </fieldset>

        <!-- Themes -->
        <fieldset class="tw:flex tw:flex-wrap tw:gap-2">
          <legend class="tw:font-title tw:font-medium tw:text-sm tw:mb-2">
            Themes
          </legend>
          <label
            v-for="theme in THEMES.toSorted((a, b) =>
              a.name.localeCompare(b.name)
            )"
            :key="theme.id"
            class="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer"
          >
            <input
              v-model="draftThemes"
              type="checkbox"
              :value="theme.id"
              class="tw:w-4 tw:h-4"
            />
            <span class="tw:text-sm">{{ theme.name }}</span>
          </label>
        </fieldset>
      </div>

      <template #footer>
        <div class="tw:flex tw:items-center tw:justify-end tw:gap-4">
          <TheButton
            variant="secondary"
            :disabled="!hasDraftSelections"
            @click="clearAll"
          >
            Clear All
          </TheButton>
          <TheButton
            :disabled="!hasDraftChanges"
            @click="applyChanges"
          >
            Apply Changes
          </TheButton>
        </div>
      </template>
    </TheDrawer>
  </div>
</template>
