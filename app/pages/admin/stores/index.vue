<script setup lang="ts">
import type { StoreWithRelations } from "~~/shared/schemas/store";

definePageMeta({
  name: "AdminStoresPage",
});

const { data: stores, refresh } = useFetch<StoreWithRelations[]>("/api/stores");

const selectedStore = ref<StoreWithRelations | null>(null);
const isUpdateModalOpen = ref(false);

/** Handle store update */
async function handleStoreUpdate(updatedStore: {
  name: string;
  supportedPlatformIds: number[];
}) {
  try {
    await $fetch(`/api/stores/${selectedStore.value?.id}`, {
      method: "patch",
      body: updatedStore,
    });

    isUpdateModalOpen.value = false;
    selectedStore.value = null;
    refresh();
  } catch (error) {
    console.error(error);
  }
}

/** Open update modal */
function openUpdateModal(store: StoreWithRelations) {
  selectedStore.value = store;
  isUpdateModalOpen.value = true;
}
</script>

<template>
  <div class="tw:container">
    <h1 class="stores-page__title">Stores</h1>

    <p
      v-if="!stores?.length"
      class="stores-page__empty"
    >
      No stores found
    </p>

    <div
      v-else
      role="list"
      class="stores-page__list"
      aria-label="Stores list"
    >
      <div
        v-for="store in stores"
        :key="store.id"
        role="listitem"
        class="stores-page__item"
      >
        <div class="stores-page__item-content">
          <h2 class="stores-page__item-title">
            {{ store.name }}
          </h2>
          <p class="stores-page__item-slug">
            {{ store.slug }}
          </p>
          <div class="stores-page__item-platforms">
            <span
              v-for="sp in store.supportedPlatforms"
              :key="sp.platform.id"
              class="stores-page__item-platform"
            >
              {{ sp.platform.abbreviation }}
            </span>
          </div>
        </div>

        <button
          type="button"
          class="stores-page__item-action"
          @click="openUpdateModal(store)"
        >
          Update
        </button>
      </div>
    </div>

    <TheModal
      v-model:open="isUpdateModalOpen"
      title="Update Store"
    >
      <StoreUpdateForm
        v-if="selectedStore"
        :store="selectedStore"
        @submit="handleStoreUpdate"
      />
    </TheModal>
  </div>
</template>

<style lang="scss">
.stores-page {
  &__title {
    margin-block-end: 2rem;
    font-size: 2rem;
    font-weight: 700;
  }

  &__empty {
    color: rgb(var(--tw-gray-500));
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background-color: rgb(var(--tw-white));
    border: 1px solid rgb(var(--tw-gray-200));
    border-radius: 0.5rem;
  }

  &__item-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__item-title {
    font-weight: 600;
  }

  &__item-slug {
    color: rgb(var(--tw-gray-500));
  }

  &__item-platforms {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-block-start: 0.5rem;
  }

  &__item-platform {
    padding-block: 0.25rem;
    padding-inline: 0.5rem;
    font-size: 0.875rem;
    color: rgb(var(--tw-gray-700));
    background-color: rgb(var(--tw-gray-100));
    border-radius: 0.25rem;
  }

  &__item-action {
    padding-block: 0.5rem;
    padding-inline: 1rem;
    color: rgb(var(--tw-white));
    background-color: rgb(var(--tw-blue-600));
    border-radius: 0.375rem;
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: rgb(var(--tw-blue-700));
    }
  }
}
</style>
