<script setup lang="ts">
import { SUPPORTED_GAME_MODES } from "~~/shared/constants/gameModes";

interface Props {
  external?: boolean;
  include?: ("gameModes" | "playerPerspectives" | "genres" | "themes")[];
}

const props = withDefaults(defineProps<Props>(), {
  external: false,
  include: () => ["gameModes"],
});

const isDrawerOpen = ref(false);

const selectedGameModes = defineModel<number[]>("gameModes", {
  default: [],
});

// Draft states
const draftGameModes = ref<number[]>([]);

const currentGameModes = computed(() => {
  return SUPPORTED_GAME_MODES;
});

// Initialize draft states when drawer opens
watch(isDrawerOpen, newValue => {
  if (newValue) {
    draftGameModes.value = [...selectedGameModes.value];
  }
});

// Draft computeds
const hasDraftChanges = computed(() => {
  return !isArrayEqual(draftGameModes.value, selectedGameModes.value);
});
const hasDraftSelections = computed(() => draftGameModes.value.length > 0);
const totalDraftCount = computed(() => draftGameModes.value.length);

function clearAll() {
  draftGameModes.value = [];
}

function applyChanges() {
  selectedGameModes.value = [...draftGameModes.value];
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
        <fieldset
          v-if="props.include?.includes('gameModes')"
          class="tw:flex tw:flex-wrap tw:gap-2"
        >
          <legend class="tw:font-title tw:font-medium tw:text-sm tw:mb-2">
            Game Modes
          </legend>
          <label
            v-for="gameMode in currentGameModes.toSorted((a, b) =>
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
