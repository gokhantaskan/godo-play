<script setup lang="ts">
import type { GameMode } from "~~/server/db/schema";

import { useGameModes } from "../../_composables/useGameModes";
import AdminGameModeCreateFormInner from "./GameModeCreateFormInner.vue";

const props = defineProps<{
  gameMode: GameMode;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { refresh } = useGameModes();

const form = reactive({
  name: props.gameMode.name,
  slug: props.gameMode.slug,
});

const pending = ref(false);
const error = ref<any>(null);

const errors = computed(() => {
  if (!error.value) {
    return {};
  }

  const data = error.value?.data;
  if (!data) {
    return {};
  }

  return Array.isArray(data)
    ? data.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.path[0]]: curr.message,
        }),
        {}
      )
    : {};
});

async function onSubmit() {
  pending.value = true;
  error.value = null;

  try {
    await $fetch<GameMode>(`/api/game-modes/${props.gameMode.id}`, {
      method: "PATCH",
      body: form,
    });

    await refresh();
    emit("close");
  } catch (err) {
    error.value = err;
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <AdminGameModeCreateFormInner
      v-model="form"
      :errors="errors"
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
