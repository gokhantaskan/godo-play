<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import isEqual from "lodash/isEqual";

const isDrawerOpen = ref(false);
const gameModes = ref<ReadGameMode[]>([]);
const { gameModes: sessionGameModes } = useSessionState();

// Watch for changes in session game modes
watch(
  sessionGameModes,
  (newValue, oldValue) => {
    if (!isEqual(newValue, oldValue)) {
      gameModes.value = newValue;
    }
  },
  { immediate: true }
);

const selectedGameModes = defineModel<number[]>("gameModes", {
  default: [],
});

const freeToPlay = defineModel<boolean>("freeToPlay", {
  default: false,
});

// Draft states
const draftGameModes = ref<number[]>([]);
const draftFreeToPlay = ref(false);

const currentGameModes = computed(() => {
  return gameModes.value.toSorted((a, b) => a.name.localeCompare(b.name));
});

// Initialize draft states when drawer opens
watch(isDrawerOpen, newValue => {
  if (newValue) {
    draftGameModes.value = [...selectedGameModes.value];
    draftFreeToPlay.value = freeToPlay.value;
  }
});

// Draft computeds
const hasDraftChanges = computed(() => {
  return (
    !isArrayEqual(draftGameModes.value, selectedGameModes.value) ||
    draftFreeToPlay.value !== freeToPlay.value
  );
});
const hasDraftSelections = computed(
  () => draftGameModes.value.length > 0 || draftFreeToPlay.value
);
const totalDraftCount = computed(() => {
  let count = draftGameModes.value.length;
  if (draftFreeToPlay.value) {
    count++;
  }
  return count;
});

function clearAll() {
  draftGameModes.value = [];
  draftFreeToPlay.value = false;
}

function applyChanges() {
  selectedGameModes.value = [...draftGameModes.value];
  freeToPlay.value = draftFreeToPlay.value;
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
      class="category-drawer"
      :before-close="handleBeforeClose"
      title="Categories"
      size="30rem"
      :description="
        hasDraftSelections
          ? `${totalDraftCount} ${totalDraftCount === 1 ? 'category' : 'categories'} selected`
          : 'Select categories to filter games'
      "
    >
      <div class="tw:space-y-6 tw:divide-y tw:divide-y-gray-200">
        <!-- Game Modes -->
        <Disclosure
          v-slot="{ open }"
          as="div"
        >
          <DisclosureButton :class="['clean-button disclosure-button']">
            Game Modes
            <Icon :name="open ? 'lucide:chevron-up' : 'lucide:chevron-down'" />
          </DisclosureButton>
          <DisclosurePanel class="disclosure-panel">
            <label
              v-for="gameMode in currentGameModes"
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
          </DisclosurePanel>
        </Disclosure>

        <!-- Price -->
        <Disclosure
          v-slot="{ open }"
          as="div"
        >
          <DisclosureButton :class="['clean-button disclosure-button']">
            Price
            <Icon :name="open ? 'lucide:chevron-up' : 'lucide:chevron-down'" />
          </DisclosureButton>
          <DisclosurePanel class="disclosure-panel">
            <label class="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer">
              <input
                v-model="draftFreeToPlay"
                type="checkbox"
                class="tw:w-4 tw:h-4"
              />
              <span class="tw:text-sm">Free to Play</span>
            </label>
          </DisclosurePanel>
        </Disclosure>
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

<style lang="scss" scoped>
$space: 0.5rem;

.disclosure-button {
  width: 100%;
  padding-block: 0.5rem;
  padding-inline: 0;
  font-family: var(--font-title);
  font-weight: 500;
  font-size: 1rem;
  margin-block-end: $space;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space;
}

.disclosure-panel {
  display: grid;
  gap: calc($space * 1.5);
  margin-block-end: calc($space * 2);
}

.category-drawer {
  :deep(.drawer__backdrop) {
    backdrop-filter: unset !important;
  }
}
</style>
