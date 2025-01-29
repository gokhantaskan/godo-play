<script setup lang="ts">
import type {
  PlatformGroups,
  Store,
  StoreData,
  SubmitGameFormData,
} from "~/types/submit-game";
import { CATEGORIES } from "~~/shared/constants/categories";
import type { GameSubmissionWithRelations } from "~~/shared/types";

interface Props {
  game: GameSubmissionWithRelations;
  disabled?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "refresh"): void;
}>();

const igdbGame = ref<Record<string, any> | null>(null);
const isLoadingIgdbGame = ref(false);

const {
  platformGroups,
  stores: pcStores,
  storePlatforms,
  gameModeIds,
} = transformSubmissionToFormData(props.game);

const categoryModel = ref<number>(props.game.category);
const platformGroupsModel = ref<PlatformGroups>(platformGroups);
const pcStoresModel = ref<Store["slug"][]>(pcStores);
// Platforms that are available for crossplay on PC (in the same group as PC)
const storePlatformsModel = ref<StoreData>(storePlatforms);
const gameModesModel = ref<number[]>(gameModeIds);

async function fetchIgdbGame() {
  if (!props.game.external?.igdbId) {
    return;
  }

  try {
    isLoadingIgdbGame.value = true;

    const data = await $fetch<any[]>("/api/igdb/games", {
      method: "POST",
      body: {
        fields:
          "name,slug,category,game_modes.name,genres.name,platforms.name,themes.name",
        where: `id = ${props.game.external.igdbId}`,
      },
    });

    if (Array.isArray(data) && data.length > 0) {
      igdbGame.value = data[0];
    }
  } catch (error) {
    console.error("Failed to fetch IGDB game data:", error);
  } finally {
    isLoadingIgdbGame.value = false;
  }
}

async function handleSave() {
  try {
    await $fetch(`/api/games/${props.game.id}`, {
      method: "PATCH",
      body: {
        category: categoryModel.value,
        platformGroups: platformGroupsModel.value,
        pcStores: pcStoresModel.value,
        pcStoresPlatforms: storePlatformsModel.value,
        gameModeIds: gameModesModel.value,
      },
    });

    emit("refresh");
  } catch (error) {
    console.error("Failed to save changes:", error);
  }
}

// Expose the save method for parent component
defineExpose({
  save: handleSave,
});

function transformSubmissionToFormData(
  submission: Props["game"]
): SubmitGameFormData {
  // Transform platform groups
  const platformGroups: PlatformGroups = submission.platformGroups.map(group =>
    group.platformGroupPlatforms.map(p => p.platform.id)
  );

  // Transform PC store platforms
  const stores = submission.storePlatforms.map(store => store.storeSlug);
  const storePlatforms: StoreData = submission.storePlatforms.reduce(
    (acc, store) => {
      acc[store.storeSlug] = {
        crossplayPlatforms: store.crossplayEntries.map(
          entry => entry.platform.id
        ),
      };
      return acc;
    },
    {} as StoreData
  );

  // Transform game modes
  const gameModeIds = submission.gameSubmissionGameModes.map(
    mode => mode.gameModeId
  );

  return {
    platformGroups,
    stores: stores,
    storePlatforms,
    gameModeIds,
  };
}

function syncPCStorePlatforms() {
  // Find the group that contains PC (id: 6)
  const pcGroup = platformGroupsModel.value.find(group => group.includes(6));

  // If no PC group found, clear all PC store platforms
  if (!pcGroup) {
    storePlatformsModel.value = {};
    pcStoresModel.value = [];
    return;
  }

  // Get available crossplay platforms (excluding PC)
  const availablePlatforms = pcGroup.filter(id => id !== 6);

  // Update each PC store's crossplay platforms
  storePlatformsModel.value = Object.fromEntries(
    pcStoresModel.value.map(storeSlug => {
      const currentCrossplayPlatforms =
        storePlatformsModel.value[storeSlug]?.crossplayPlatforms ?? [];

      // Keep only platforms that are in both the current list and the PC group
      const validPlatforms = currentCrossplayPlatforms.filter(platformId =>
        availablePlatforms.includes(platformId)
      );

      return [storeSlug, { crossplayPlatforms: validPlatforms }];
    })
  );
}

// Watch platform groups to sync PC store platforms
watch(
  platformGroupsModel,
  () => {
    syncPCStorePlatforms();
  },
  { deep: true, immediate: true }
);

// Fetch IGDB game data when mounted
onMounted(() => {
  fetchIgdbGame();
});
</script>

<template>
  <div class="submission-details">
    <div
      v-if="igdbGame"
      class="submission-details__igdb"
    >
      <ul class="tw:text-sm tw:p-0 tw:mb-2">
        <li>
          <strong>Category:</strong>
          {{ CATEGORIES[igdbGame.category]?.name }}
        </li>
        <li>
          <strong>Platforms:</strong>
          {{
            igdbGame.platforms?.map((platform: any) => platform.name).join(", ")
          }}
        </li>
        <li>
          <strong>Game modes:</strong>
          {{ igdbGame.game_modes?.map((mode: any) => mode.name).join(", ") }}
        </li>
        <li>
          <strong>Genres:</strong>
          {{ igdbGame.genres?.map((genre: any) => genre.name).join(", ") }}
        </li>
        <li>
          <strong>Themes:</strong>
          {{ igdbGame.themes?.map((theme: any) => theme.name).join(", ") }}
        </li>
      </ul>
    </div>

    <div
      v-else-if="isLoadingIgdbGame"
      class="submission-details__loading"
    >
      Loading IGDB data...
    </div>

    <SubmitGameFormInner
      v-model:category="categoryModel"
      v-model:platform-groups="platformGroups"
      v-model:pc-stores="pcStores"
      v-model:store-platforms="storePlatforms"
      v-model:game-modes="gameModesModel"
      :disabled="disabled"
    />

    <div
      v-if="game.status === 'approved'"
      class="submission-details__save-button"
    >
      <TheButton
        size="sm"
        variant="primary"
        @click="handleSave"
      >
        Save Changes
      </TheButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.submission-details {
  padding: 1rem;
  background-color: var(--tw-color-gray-50);
  border-radius: var(--tw-radius-md);

  &__igdb {
    margin-block-end: 1rem;
    padding: 1rem;
    background-color: white;
    border-radius: var(--tw-radius-md);
    border: 1px solid var(--tw-color-border);
  }

  &__loading {
    margin-block-end: 1rem;
    padding: 1rem;
    font-size: 0.875rem;
    color: var(--tw-color-text-muted);
    background-color: white;
    border-radius: var(--tw-radius-md);
    border: 1px solid var(--tw-color-border);
  }

  &__save-button {
    margin-block-start: 1rem;
  }
}
</style>
