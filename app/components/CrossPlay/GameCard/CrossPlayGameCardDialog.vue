<script setup lang="ts">
import { Dialog, DialogPanel } from "@headlessui/vue";

import { QUERY_KEYS } from "~~/shared/constants/queryKeys";
import type { GameSubmissionWithRelations } from "~~/shared/types";
import type { GameDetails } from "~~/shared/types/igdb/gameDetails";

export interface CrossPlayGameCardDialogProps {
  slug: string;
}

const props = defineProps<CrossPlayGameCardDialogProps>();
const isOpen = defineModel<boolean>("open");

const {
  data: fetchedIGDBGame,
  status: igdbStatus,
  refresh: refreshIgdbGame,
} = useFetch<GameDetails>(() => `/api/public/igdb/${props.slug}`, {
  key: QUERY_KEYS.IGDBGame(props.slug),
  server: false,
  immediate: false,
});

const {
  data: fetchedDbGame,
  status: dbStatus,
  refresh: refreshDbGame,
} = useFetch<GameSubmissionWithRelations>(QUERY_KEYS.DbGame(props.slug), {
  key: QUERY_KEYS.DbGame(props.slug),
  server: false,
  immediate: false,
});

const isLoading = computed(
  () => igdbStatus.value === "pending" || dbStatus.value === "pending"
);

// Watch modal state to fetch data when opened
watch(isOpen, async newValue => {
  if (newValue) {
    await refresh();
  }
});

async function refresh() {
  await Promise.all([refreshIgdbGame(), refreshDbGame()]);
}

function closeDialog() {
  history.back();
}
</script>

<template>
  <Dialog
    :open="isOpen"
    class="game-dialog"
    @close="closeDialog"
  >
    <div class="game-dialog__backdrop">
      <DialogPanel class="game-dialog__wrapper">
        <header class="game-dialog__header">
          <button
            class="clean-button game-dialog__close"
            size="sm"
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
    </div>
  </Dialog>
</template>

<style lang="scss" scoped>
.game-dialog {
  position: fixed;
  inset: 0;
  z-index: 50;

  &__backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__wrapper {
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
