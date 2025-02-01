<script setup lang="ts">
import type { GameMode, InsertGameMode } from "~~/server/db/schema";

import { useGameModes } from "../../_composables/useGameModes";
import AdminGameModeCreateFormInner from "./GameModeCreateFormInner.vue";

const emit = defineEmits<{
  close: [];
}>();

const { refresh } = useGameModes();

const form = reactive<Pick<InsertGameMode, "name" | "slug">>({
  name: "",
  slug: "",
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
    await $fetch<GameMode>("/api/game-modes", {
      method: "POST",
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
        Create
      </TheButton>
    </div>
  </form>
</template>
