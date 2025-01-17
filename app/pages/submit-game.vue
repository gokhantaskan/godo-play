<script setup lang="ts">
import type { GameOption } from "~/components/SubmitGame/SubmitGameAutocomplete.vue";

const selectedGame = ref<GameOption | null>(null);

async function submit() {
  if (!selectedGame.value) {
    return;
  }

  console.log("submit", selectedGame.value);
}
</script>

<template>
  <div class="tw:max-w-2xl tw:mx-auto tw:p-4">
    <form @submit.prevent="submit">
      <SubmitGameAutocomplete v-model="selectedGame" />
      <span>{{ selectedGame }}</span>

      <div class="tw:mt-4">
        <TheButton
          type="submit"
          :disabled="!selectedGame"
        >
          Submit
        </TheButton>
      </div>
    </form>
  </div>
</template>
