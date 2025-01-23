<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";

import type {
  PCStore,
  PCStoreData,
  PlatformGroups,
  SubmitGameFormData,
} from "~/types/submit-game";
import type { GameSubmissionWithRelations } from "~~/shared/types/submissions";

interface Props {
  submission: GameSubmissionWithRelations & {
    gameSubmissionGameModes: Array<{
      gameModeId: number;
      gameMode: {
        id: number;
        name: string;
        slug: string;
      };
    }>;
  };
  isPending?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "refresh"): void;
}>();

const { platformGroups, pcStores, pcStorePlatforms, gameModeIds } =
  transformSubmissionToFormData(props.submission);

const platformGroupsModel = ref<PlatformGroups>(platformGroups);
const pcStoresModel = ref<PCStore["slug"][]>(pcStores);
const pcStorePlatformsModel = ref<PCStoreData>(pcStorePlatforms);
const gameModesModel = ref<number[]>(gameModeIds);

async function handleUpdate(status: "approved" | "rejected") {
  try {
    if (status === "approved") {
      // Save form changes first
      await $fetch(`/api/submissions/${props.submission.id}`, {
        method: "PATCH",
        body: {
          platformGroups: platformGroupsModel.value,
          pcStores: pcStoresModel.value,
          pcStoresPlatforms: pcStorePlatformsModel.value,
          gameModeIds: gameModesModel.value,
        },
      });
    }

    // Then update the status
    await $fetch("/api/submissions/update", {
      method: "POST",
      body: {
        id: props.submission.id,
        status,
      },
    });

    emit("refresh");
  } catch (error) {
    console.error("Failed to update submission:", error);
  }
}

async function handleDelete() {
  if (!confirm("Are you sure you want to delete this submission?")) {
    return;
  }

  try {
    await $fetch(`/api/submissions/${props.submission.id}`, {
      method: "DELETE",
    });

    emit("refresh");
  } catch (error) {
    console.error("Failed to delete submission:", error);
  }
}

async function handleSave() {
  try {
    await $fetch(`/api/submissions/${props.submission.id}`, {
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
</script>

<template>
  <div class="submission-card">
    <div class="submission-card__image">
      <NuxtImg
        :src="`https://images.igdb.com/igdb/image/upload/t_cover_small/${submission.gameImageId}.jpg`"
        :alt="submission.gameName"
      />
    </div>
    <div class="submission-card__content">
      <div class="submission-card__header">
        <h2 class="submission-card__title">{{ submission.gameName }}</h2>
        <TheButton
          v-if="submission.status === 'approved'"
          size="sm"
          variant="secondary"
          @click="handleDelete"
        >
          Delete
        </TheButton>
      </div>
      <p class="submission-card__meta">ID: {{ submission.id }}</p>
      <p class="submission-card__meta">
        Submitted:
        {{
          new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(submission.createdAt))
        }}
      </p>

      <div class="submission-card__actions">
        <Disclosure
          v-slot="{ open }"
          as="div"
        >
          <DisclosureButton class="submission-card__edit-button">
            {{ open ? "Hide Details" : "Show Details" }}
          </DisclosureButton>
          <DisclosurePanel class="submission-card__edit-panel">
            <SubmitGameFormInner
              v-model:platform-groups="platformGroupsModel"
              v-model:pc-stores="pcStoresModel"
              v-model:pc-store-platforms="pcStorePlatformsModel"
              v-model:game-modes="gameModesModel"
              :disabled="submission.status === 'rejected'"
            />

            <div
              v-if="submission.status === 'approved'"
              class="submission-card__save-button"
            >
              <TheButton
                size="sm"
                variant="primary"
                @click="handleSave"
              >
                Save Changes
              </TheButton>
            </div>
          </DisclosurePanel>
        </Disclosure>

        <div
          v-if="isPending"
          class="submission-card__status-buttons"
        >
          <TheButton
            size="sm"
            variant="primary"
            @click="handleUpdate('approved')"
          >
            Approve
          </TheButton>
          <TheButton
            size="sm"
            variant="secondary"
            @click="handleUpdate('rejected')"
          >
            Reject
          </TheButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.submission-card {
  --card-spacing: 0.75rem;
  --image-width: 4rem;

  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--card-spacing);
  padding: var(--card-spacing);
  background-color: white;
  border-radius: var(--tw-radius-md);
  border: 1px solid var(--tw-color-border);

  &__image {
    img {
      aspect-ratio: 3/4;
      object-fit: cover;
      border-radius: var(--tw-radius-sm);
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.1);
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  &__title {
    font-size: 1rem;
    font-weight: 500;
    color: var(--tw-color-text);
    line-height: 1.25;
  }

  &__meta {
    font-size: 0.875rem;
    color: var(--tw-color-text-muted);
    line-height: 1.25;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-block-start: 0.5rem;
  }

  &__edit-button {
    width: fit-content;
    padding-block: 0.25rem;
    padding-inline: 0.75rem;
    font-size: 0.875rem;
    color: var(--tw-color-text-muted);
    background-color: var(--tw-color-gray-100);
    border-radius: var(--tw-radius-sm);
    transition: all 0.2s ease;

    &:hover {
      background-color: var(--tw-color-gray-200);
    }

    &[aria-expanded="true"] {
      background-color: var(--tw-color-primary);
      color: white;
    }
  }

  &__edit-panel {
    margin-block-start: 1rem;
    padding: 1rem;
    background-color: var(--tw-color-gray-50);
    border-radius: var(--tw-radius-md);
  }

  &__save-button {
    margin-block-start: 1rem;
    display: flex;
    justify-content: flex-end;
  }

  &__status-buttons {
    display: flex;
    gap: 0.5rem;
  }
}
</style>
