<script setup lang="ts">
import type { GameMode } from "~~/server/db/schema";

import { useGameModes } from "../../_composables/useGameModes";
import GameModeUpdateForm from "./GameModeUpdateForm.vue";

const props = defineProps<{
  gameMode: GameMode;
}>();

const { refresh } = useGameModes();
const toast = useToast();

const isUpdateModalOpen = ref(false);
const isDeleting = ref(false);

async function handleDelete() {
  if (!confirm(`Are you sure you want to delete ${props.gameMode.name}?`)) {
    return;
  }

  isDeleting.value = true;

  try {
    await $fetch(`/api/game-modes/${props.gameMode.id}`, {
      method: "DELETE",
    });
    toast.show(`Game mode "${props.gameMode.name}" deleted`, "success");
    await refresh();
  } catch (error) {
    const apiError = extractApiError(error);
    toast.show(apiError?.message || "Failed to delete game mode", "error");
  } finally {
    isDeleting.value = false;
  }
}
</script>

<template>
  <div
    role="listitem"
    class="tw:flex tw:items-center tw:justify-between tw:gap-4 tw:rounded-lg tw:border tw:border-gray-200 tw:p-4"
  >
    <div>
      <h3 class="tw:font-medium">{{ gameMode.name }}</h3>
      <p class="tw:text-sm tw:text-gray-500">{{ gameMode.slug }}</p>
    </div>

    <div class="tw:flex tw:items-center tw:gap-2">
      <TheButton
        variant="secondary"
        @click="isUpdateModalOpen = true"
      >
        <Icon name="lucide:edit" />
      </TheButton>
      <TheButton
        variant="danger"
        :loading="isDeleting"
        @click="handleDelete"
      >
        <Icon name="lucide:trash" />
      </TheButton>
    </div>

    <TheModal
      v-model:open="isUpdateModalOpen"
      max-width="768px"
      :title="`Update ${gameMode.name}`"
    >
      <GameModeUpdateForm
        :game-mode="gameMode"
        @close="isUpdateModalOpen = false"
      />
    </TheModal>
  </div>
</template>
