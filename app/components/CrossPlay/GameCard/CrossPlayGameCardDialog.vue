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
  if (newValue) {
    // Store current URL in state and update URL
    history.pushState(
      { isGameDialog: true, current: window.location.pathname },
      "",
      `/games/${props.slug}`
    );

    if (!cachedIGDBGame.value || !cachedDbGame.value) {
      await refresh();
    }
  } else {
    // Restore previous URL from state
    if (history.state?.current) {
      history.pushState(history.state, "", history.state.current);
    } else {
      history.back();
    }
  }
});

// Handle browser back/forward button
onMounted(() => {
  window.addEventListener("popstate", handlePopState);
});

onUnmounted(() => {
  window.removeEventListener("popstate", handlePopState);
});

function handlePopState(event: PopStateEvent) {
  // Close dialog when navigating back
  if (event.state?.isGameDialog !== true && isOpen.value) {
    isOpen.value = false;
  }
}

async function refresh() {
  await Promise.all([refreshIgdbGame(), refreshDbGame()]);
}
</script>

<template>
  <TheNativeDialog v-model:open="isOpen">
    <div class="game-dialog">
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
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  &__header {
    inset-block-start: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background-color: transparent;
    padding: 0.5rem;
  }

  &__close {
    color: white;
    width: 2rem;
    height: 2rem;
    background-color: transparent;
    border: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999rem;
    background-color: rgba(255, 255, 255, 0.5);

    svg {
      width: 1.25rem;
      height: 1.25rem;
      color: var(--tw-color-red);
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
