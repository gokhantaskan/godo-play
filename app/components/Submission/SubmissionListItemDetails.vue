<script setup lang="ts">
import type {
  PCStore,
  PCStoreData,
  PlatformGroups,
  SubmitGameFormData,
} from "~/types/submit-game";
import type { GameSubmissionWithRelations } from "~~/shared/types";

interface Props {
  submission: GameSubmissionWithRelations;
  disabled?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "refresh"): void;
}>();

const igdbGame = ref<Record<string, any> | null>(null);
const isLoadingIgdbGame = ref(false);

const { platformGroups, pcStores, pcStorePlatforms, gameModeIds } =
  transformSubmissionToFormData(props.submission);

const platformGroupsModel = ref<PlatformGroups>(platformGroups);
const pcStoresModel = ref<PCStore["slug"][]>(pcStores);
const pcStorePlatformsModel = ref<PCStoreData>(pcStorePlatforms);
const gameModesModel = ref<number[]>(gameModeIds);

async function fetchIgdbGame() {
  if (!props.submission.external?.igdbId) {
    return;
  }

  try {
    isLoadingIgdbGame.value = true;

    const data = await $fetch("/api/igdb/games", {
      method: "POST",
      body: {
        fields:
          "name,slug,category,game_modes.name,genres.name,platforms.name,themes.name",
        where: `id = ${props.submission.external.igdbId}`,
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
    await $fetch(`/api/games/${props.submission.id}`, {
      method: "PATCH",
      body: {
        platformGroups: platformGroupsModel.value,
        pcStores: pcStoresModel.value,
        pcStoresPlatforms: pcStorePlatformsModel.value,
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
  submission: Props["submission"]
): SubmitGameFormData {
  // Transform platform groups
  const platformGroups: PlatformGroups = submission.platformGroups.map(group =>
    group.platformGroupPlatforms.map(p => p.platform.id)
  );

  // Transform PC store platforms
  const pcStores = submission.pcStorePlatforms.map(store => store.storeSlug);
  const pcStorePlatforms: PCStoreData = submission.pcStorePlatforms.reduce(
    (acc, store) => {
      acc[store.storeSlug] = {
        crossplayPlatforms: store.crossplayEntries.map(
          entry => entry.platform.id
        ),
      };
      return acc;
    },
    {} as PCStoreData
  );

  // Transform game modes
  const gameModeIds = submission.gameSubmissionGameModes.map(
    mode => mode.gameModeId
  );

  return {
    platformGroups,
    pcStores,
    pcStorePlatforms,
    gameModeIds,
  };
}

function syncPCStorePlatforms() {
  // Find the group that contains PC (id: 6)
  const pcGroup = platformGroupsModel.value.find(group => group.includes(6));

  // If no PC group found, clear all PC store platforms
  if (!pcGroup) {
    pcStorePlatformsModel.value = {};
    pcStoresModel.value = [];
    return;
  }

  // Get available crossplay platforms (excluding PC)
  const availablePlatforms = pcGroup.filter(id => id !== 6);

  // Update each PC store's crossplay platforms
  pcStorePlatformsModel.value = Object.fromEntries(
    pcStoresModel.value.map(storeSlug => {
      const currentCrossplayPlatforms =
        pcStorePlatformsModel.value[storeSlug]?.crossplayPlatforms ?? [];

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
  { deep: true }
);

// Initial sync after data transformation
syncPCStorePlatforms();

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
      v-model:platform-groups="platformGroupsModel"
      v-model:pc-stores="pcStoresModel"
      v-model:pc-store-platforms="pcStorePlatformsModel"
      v-model:game-modes="gameModesModel"
      :disabled="disabled"
    />

    <div
      v-if="submission.status === 'approved'"
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
    display: flex;
    justify-content: flex-end;
  }
}
</style>
