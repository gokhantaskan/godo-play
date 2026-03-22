<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";

import { QUERY_KEYS } from "~~/shared/constants/queryKeys";
import type { GameWithRelations } from "~~/shared/types";
import type { GameDetails } from "~~/shared/types/igdb/gameDetails";

export interface CrossPlayGameCardDialogProps {
  slug: string;
}

const props = defineProps<CrossPlayGameCardDialogProps>();
const isOpen = defineModel<boolean>("open");

const {
  data: fetchedDbGame,
  status: dbStatus,
  refresh: refreshDbGame,
} = useFetch<GameWithRelations>(QUERY_KEYS.DbGame(props.slug), {
  key: QUERY_KEYS.DbGame(props.slug),
  server: false,
  immediate: false,
});

// Fetch IGDB game using the IGDB ID from the database
const fetchedIGDBGame = ref<GameDetails | null>(null);
const isLoadingIgdb = ref(false);

const isLoading = computed(
  () => isLoadingIgdb.value || dbStatus.value === "pending"
);

// Watch modal state to fetch data when opened
watch(isOpen, async newValue => {
  if (newValue) {
    await refresh();
  }
});

async function refresh() {
  // First fetch DB game to get IGDB ID, then fetch IGDB game
  await refreshDbGame();
  const igdbId = fetchedDbGame.value?.external?.igdbId;
  if (igdbId) {
    isLoadingIgdb.value = true;
    try {
      fetchedIGDBGame.value = await $fetch<GameDetails>(
        `/api/public/igdb/${igdbId}`
      );
    } finally {
      isLoadingIgdb.value = false;
    }
  }
}

function closeDialog() {
  history.back();
}
</script>

<template>
  <TransitionRoot
    appear
    :show="isOpen"
    as="template"
  >
    <Dialog
      class="game-dialog"
      @close="closeDialog"
    >
      <TransitionChild
        as="template"
        enter-active-class="game-dialog__backdrop--enter-active"
        enter-from-class="game-dialog__backdrop--enter-from"
        leave-active-class="game-dialog__backdrop--leave-active"
        leave-to-class="game-dialog__backdrop--leave-to"
      >
        <div
          class="game-dialog__backdrop"
          aria-hidden="true"
        />
      </TransitionChild>

      <TransitionChild
        as="template"
        enter-active-class="game-dialog__panel--enter-active"
        enter-from-class="game-dialog__panel--enter-from"
        leave-active-class="game-dialog__panel--leave-active"
        leave-to-class="game-dialog__panel--leave-to"
      >
        <DialogPanel class="game-dialog__wrapper">
          <header class="game-dialog__header">
            <button
              class="clean-button game-dialog__close"
              type="button"
              @click="closeDialog"
            >
              <Icon name="lucide:x" />
            </button>
          </header>

          <div class="game-dialog__content">
            <template v-if="isOpen">
              <div
                v-if="isLoading"
                class="game-dialog__loader"
              >
                <Icon
                  name="lucide:loader-2"
                  class="game-dialog__loader-icon"
                />
              </div>
              <CrossPlayGameDetails
                v-else-if="fetchedDbGame && fetchedIGDBGame"
                :igdb-game="fetchedIGDBGame"
                :db-game="fetchedDbGame"
                :game-name="fetchedDbGame.name"
              />
            </template>
          </div>
        </DialogPanel>
      </TransitionChild>
    </Dialog>
  </TransitionRoot>
</template>

<style lang="scss" scoped>
.game-dialog {
  position: fixed;
  inset: 0;
  z-index: 50;

  &__backdrop {
    position: fixed;
    inset: 0;
    background-color: var(--color-overlay);
  }

  &__wrapper {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  &__header {
    flex-shrink: 0;
    position: relative;
    background-color: transparent;
    width: 100%;
    height: 4rem;
    z-index: 10;
  }

  &__close {
    position: absolute;
    inset: 0;
    padding-inline: 1rem;
    color: white;
    background-color: transparent;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;

    svg {
      width: 2rem;
      height: 2rem;
      color: white;
    }
  }

  &__content {
    flex: 1;
    overflow-y: auto;
    background-color: var(--tw-color-bg);
    position: relative;
  }

  &__loader {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--tw-color-bg);
  }

  &__loader-icon {
    width: 2rem;
    height: 2rem;
    color: var(--tw-color-primary);
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

<!-- Unscoped: HeadlessUI TransitionChild applies classes dynamically,
     which don't receive Vue's scoped data attribute -->
<style lang="scss">
.game-dialog {
  // Backdrop transition
  &__backdrop {
    &--enter-active,
    &--leave-active {
      transition: opacity 0.25s ease;
    }

    &--enter-from,
    &--leave-to {
      opacity: 0;
    }
  }

  // Panel transition
  &__panel {
    &--enter-active {
      transition:
        opacity 0.3s ease,
        transform 0.3s ease;
    }

    &--leave-active {
      transition:
        opacity 0.2s ease,
        transform 0.2s ease;
    }

    &--enter-from {
      opacity: 0;
      transform: translateY(2rem);
    }

    &--leave-to {
      opacity: 0;
      transform: translateY(1rem);
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .game-dialog {
    &__panel--enter-active,
    &__panel--leave-active {
      transition: opacity 0.15s ease;
    }

    &__panel--enter-from,
    &__panel--leave-to {
      transform: none;
    }
  }
}
</style>
