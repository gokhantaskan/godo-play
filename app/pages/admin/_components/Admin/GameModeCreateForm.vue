<script setup lang="ts">
import type { GameMode } from "~~/server/db/schema";

import { useGameModes } from "../../_composables/useGameModes";
import AdminGameModeCreateFormInner from "./GameModeCreateFormInner.vue";

type GameModeFormData = {
  name: string;
  slug: string;
  weight: number;
};

const emit = defineEmits<{
  close: [];
}>();

const { refresh } = useGameModes();

const form = reactive<GameModeFormData>({
  name: "",
  slug: "",
  weight: 1.0,
});

const pending = ref(false);

async function onSubmit() {
  pending.value = true;

  try {
    await $fetch<GameMode>("/api/game-modes", {
      method: "POST",
      body: form,
    });

    await refresh();
    emit("close");
  } catch (err) {
    alert(JSON.stringify(err));
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <form
    novalidate
    class="tw:flex tw:flex-col tw:gap-4"
    @submit.prevent="onSubmit"
  >
    <AdminGameModeCreateFormInner
      v-model="form"
      auto-slugify
    />

    <div class="tw:flex tw:justify-end tw:gap-2">
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
