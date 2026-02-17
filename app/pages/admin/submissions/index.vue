<script setup lang="ts">
import { refDebounced } from "@vueuse/core";

import type { GameWithRelations } from "~~/shared/types";
import type {
  FilterParams,
  GameStatus,
  PaginatedResponse,
  SortField,
} from "~~/shared/types/globals";

definePageMeta({
  name: "AdminGameSubmissionsPage",
});

const selectedStatuses = ref<GameStatus[]>(["pending", "approved", "rejected"]);

const selectedSort = ref<SortField>("-created_at");
const searchQuery = ref("");
const searchQueryDebounced = refDebounced(searchQuery, 500);

const { data: response, refresh } = await useFetch<
  PaginatedResponse<GameWithRelations>
>("/api/games", {
  query: computed<FilterParams>(() => ({
    limit: 400,
    status: selectedStatuses.value,
    sort: selectedSort.value,
    search: searchQueryDebounced.value || undefined,
  })),
});

const games = computed(() => response.value?.data ?? []);

const sortOptions = [
  { label: "Popularity", value: "-popularity" },
  { label: "Created At (Newest)", value: "-created_at" },
  { label: "Created At (Oldest)", value: "+created_at" },
  { label: "Updated At (Newest)", value: "-updated_at" },
  { label: "Updated At (Oldest)", value: "+updated_at" },
  { label: "First Release Date (Newest)", value: "-first_release_date" },
  { label: "First Release Date (Oldest)", value: "+first_release_date" },
] as const;
</script>

<template>
  <main class="tw:container tw:py-8">
    <header class="tw:flex tw:items-center tw:justify-between">
      <h1 class="page-title">Submissions</h1>
      <NuxtLink
        v-slot="{ navigate }"
        class="tw:inline-flex tw:items-center tw:gap-1"
        :to="{ name: 'AdminNewGamePage' }"
        custom
      >
        <TheButton @click="navigate">
          <Icon name="lucide:plus" />
          <span class="tw:sr-only">Submit a Crossplay Support</span>
        </TheButton>
      </NuxtLink>
    </header>

    <div>
      <div class="tw:flex tw:flex-wrap tw:gap-8 tw:mb-4">
        <div class="tw:flex tw:gap-4">
          <template
            v-for="status in ['pending', 'approved', 'rejected'] as const"
            :key="status"
          >
            <label class="tw:flex tw:items-center tw:gap-2">
              <input
                v-model="selectedStatuses"
                type="checkbox"
                :value="status"
              />
              <span class="tw:capitalize">{{ status }}</span>
            </label>
          </template>
        </div>

        <div class="tw:flex tw:gap-4">
          <TheSearchInput
            v-model="searchQuery"
            placeholder="Search by name..."
          />

          <select
            v-model="selectedSort"
            class="tw:px-2 tw:py-1 tw:rounded tw:border tw:border-border"
          >
            <option
              v-for="option in sortOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <div>
        <SubmissionListItem
          v-for="game in games"
          :key="game.id"
          :game="game"
          :is-pending="game.status === 'pending'"
          @refresh="refresh"
        />
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use "sass:map";
@use "@/assets/styles/abstracts/variables" as *;

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-block-end: 1.5rem;

  @media (min-width: map.get($breakpoints, "sm")) {
    font-size: 2.5rem;
  }
}

.submissions {
  --tab-spacing: 0.25rem;
  --content-spacing: 1rem;
  --border-color: var(--tw-color-border);
  --radius: var(--tw-radius-md);

  &__tab-list {
    position: relative;
    display: flex;
    gap: var(--tab-spacing);
    padding: var(--tab-spacing);
    border-radius: calc(var(--radius) * 1.5);
    background-color: color-mix(
      in slab,
      var(--tw-color-primary) 20%,
      transparent
    );
  }

  &__indicator {
    position: absolute;
    height: 100%;
    transition:
      width 300ms,
      transform 300ms;
    padding-inline: 0.25rem;
    padding-block: 0.25rem;
  }

  &__indicator-inner {
    height: 100%;
    width: 100%;
    background-color: white;
    border-radius: var(--radius);
  }

  &__tab {
    flex: 1;
    padding-block: 0.625rem;
    padding-inline: 1rem;
    color: var(--tw-color-text-muted);
    transition: color 200ms;
    z-index: 1;

    &[data-state="active"] {
      color: var(--tw-color-primary);
    }
  }

  &__panels {
    margin-block-start: 1.5rem;
  }

  &__panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__empty {
    text-align: center;
    color: var(--tw-color-text-muted);
    font-size: 0.875rem;
  }
}
</style>
