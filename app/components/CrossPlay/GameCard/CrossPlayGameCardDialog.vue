<script setup lang="ts">
import { QUERY_KEYS } from "~~/shared/constants/queryKeys";
import type { GameSubmissionWithRelations } from "~~/shared/types";
import type { GameDetails } from "~~/shared/types/igdb/gameDetails";

export interface CrossPlayGameCardDialogProps {
  slug: string;
}

const props = defineProps<CrossPlayGameCardDialogProps>();
const isOpen = defineModel<boolean>("open");

const { data: cachedIGDBGame } = useNuxtData(QUERY_KEYS.IGDBGame(props.slug));
const { data: cachedDbGame } = useNuxtData(QUERY_KEYS.DbGame(props.slug));

const {
  data: fetchedIGDBGame,
  status: igdbStatus,
  refresh: refreshIgdbGame,
} = useFetch<GameDetails>(() => `/api/games/igdb/${props.slug}`, {
  key: QUERY_KEYS.IGDBGame(props.slug),
  server: false,
  immediate: false,
  lazy: !!cachedIGDBGame.value,
});

const {
  data: fetchedDbGame,
  status: dbStatus,
  refresh: refreshDbGame,
} = useFetch<GameSubmissionWithRelations>(QUERY_KEYS.DbGame(props.slug), {
  key: QUERY_KEYS.DbGame(props.slug),
  server: false,
  immediate: false,
  lazy: !!cachedDbGame.value,
});

const gameName = computed(() => fetchedIGDBGame.value?.name);
const isLoading = computed(
  () => igdbStatus.value === "pending" || dbStatus.value === "pending"
);
const hasData = computed(() => fetchedIGDBGame.value && fetchedDbGame.value);

// Watch modal state to fetch data when opened and handle history
watch(isOpen, async newValue => {
  if (import.meta.client) {
    if (newValue) {
      if (!cachedIGDBGame.value || !cachedDbGame.value) {
        await refresh();
      }
    } else {
      // When closing, go back in history
      history.back();
    }
  } else {
    // On server side, just fetch data if needed
    if (newValue && (!cachedIGDBGame.value || !cachedDbGame.value)) {
      await refresh();
    }
  }
});

// Handle browser back/forward button
function handlePopState(event: PopStateEvent) {
  // Close dialog when navigating back, unless we're moving to a state with dialogOpen: true
  if (!event.state?.dialogOpen && isOpen.value) {
    isOpen.value = false;
  }

  // If we're moving to a state with dialogOpen: true, ensure dialog is open
  if (event.state?.dialogOpen && !isOpen.value) {
    isOpen.value = true;
  }
}

if (import.meta.client) {
  window.addEventListener("popstate", handlePopState);
}

async function refresh() {
  await Promise.all([refreshIgdbGame(), refreshDbGame()]);
}
</script>

<template>
  <TheNativeDialog
    v-model:open="isOpen"
    class="game-dialog"
  >
    <div class="game-dialog__wrapper">
      <header class="game-dialog__header">
        <button
          class="clean-button game-dialog__close"
          size="sm"
          @click="isOpen = false"
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
            v-else-if="hasData"
            :igdb-game="fetchedIGDBGame ?? null"
            :db-game="fetchedDbGame ?? null"
            :game-name="gameName ?? ''"
          />
        </template>
      </div>
    </div>
  </TheNativeDialog>
</template>

<style lang="scss" scoped>
.game-dialog {
  max-width: 100vw;
  max-height: 100dvh;

  &__wrapper {
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100dvh;
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
