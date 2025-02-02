<script setup lang="ts">
import AdminGameModeCreateForm from "../_components/Admin/GameModeCreateForm.vue";
import AdminGameModeListItem from "../_components/Admin/GameModeListItem.vue";
import { useGameModes } from "../_composables/useGameModes";

definePageMeta({
  name: "AdminGameModesPage",
});

const { data: gameModes } = useGameModes();

const isCreateModalOpen = ref(false);
</script>

<template>
  <div class="tw:container">
    <header class="tw:mb-6 tw:flex tw:items-center tw:justify-between">
      <h1 class="tw:text-2xl tw:font-bold">Game Modes</h1>
      <TheButton @click="isCreateModalOpen = true">
        <Icon
          name="lucide:plus"
          class="tw:-ml-1 tw:mr-2"
        />
        Add Game Mode
      </TheButton>
    </header>

    <section>
      <div
        role="list"
        class="tw:space-y-4"
      >
        <AdminGameModeListItem
          v-for="gameMode in gameModes"
          :key="gameMode.id"
          :game-mode="gameMode"
        />
      </div>

      <p
        v-if="gameModes?.length === 0"
        class="tw:text-center tw:text-gray-500"
      >
        No game modes found
      </p>
    </section>

    <TheModal
      v-model:open="isCreateModalOpen"
      max-width="768px"
      title="Create A Game Mode"
    >
      <AdminGameModeCreateForm @close="isCreateModalOpen = false" />
    </TheModal>
  </div>
</template>
