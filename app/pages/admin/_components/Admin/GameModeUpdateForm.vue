<script setup lang="ts">
import type { GameMode } from "~~/server/db/schema";

import { useGameModes } from "../../_composables/useGameModes";
import AdminGameModeCreateFormInner from "./GameModeCreateFormInner.vue";

type GameModeFormData = {
  name: string;
  slug: string;
  weight: number;
};

const props = defineProps<{
  gameMode: GameMode;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { refresh } = useGameModes();
const toast = useToast();
const apiError = useApiError();

const form = reactive<GameModeFormData>({
  name: props.gameMode.name,
  slug: props.gameMode.slug,
  weight: (props.gameMode as any).weight || 1.0,
});

const pending = ref(false);

async function onSubmit() {
  pending.value = true;
  apiError.clear();

  try {
    await $fetch<GameMode>(`/api/game-modes/${props.gameMode.id}`, {
      method: "PATCH",
      body: form,
    });

    toast.show("Game mode updated", "success");
    await refresh();
    emit("close");
  } catch (err) {
    apiError.set(err);
    toast.show(apiError.message.value || "Failed to update game mode", "error");
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <AdminGameModeCreateFormInner
      v-model="form"
      :errors="apiError.fieldErrors.value"
    />

    <div class="tw:mt-4 tw:flex tw:justify-end tw:gap-2">
      <TheButton
        type="button"
        variant="secondary"
        @click="$emit('close')"
      >
        Cancel
      </TheButton>
      <TheButton
        type="submit"
        :loading="pending"
      >
        Update
      </TheButton>
    </div>
  </form>
</template>
