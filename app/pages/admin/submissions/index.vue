<script setup lang="ts">
import {
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "radix-vue";

import type { GameSubmissionWithRelations } from "~~/shared/types";

type SubmissionStatus = "pending" | "approved" | "rejected";

interface GamesResponse {
  total: number;
  data: GameSubmissionWithRelations[];
  limit: number;
  offset: number;
}

definePageMeta({
  name: "AdminGameSubmissionsPage",
});

const tabs = [
  {
    status: "pending" as const,
    label: "Pending",
  },
  {
    status: "approved" as const,
    label: "Approved",
  },
  {
    status: "rejected" as const,
    label: "Rejected",
  },
];

const currentStatus = ref<SubmissionStatus>("pending");

const { data: response, refresh } = await useFetch<GamesResponse>(
  "/api/games",
  {
    query: {
      status: currentStatus,
      limit: 400,
    },
  }
);

const submissions = computed(() => response.value?.data ?? []);
</script>

<template>
  <main class="tw:container tw:py-8">
    <header class="tw:flex tw:items-center tw:justify-between">
      <h1 class="page-title">Submissions</h1>
      <NuxtLink
        v-slot="{ navigate }"
        class="tw:inline-flex tw:items-center tw:gap-1"
        :to="{ name: 'AdminNewGameSubmissionPage' }"
        custom
      >
        <TheButton @click="navigate">
          <Icon name="lucide:plus" />
          <span class="tw:sr-only">Submit a Crossplay Support</span>
        </TheButton>
      </NuxtLink>
    </header>

    <TabsRoot
      v-model="currentStatus"
      class="submissions"
      default-value="pending"
    >
      <TabsList class="submissions__tab-list">
        <TabsIndicator class="submissions__indicator">
          <div class="submissions__indicator-inner" />
        </TabsIndicator>
        <TabsTrigger
          v-for="tab in tabs"
          :key="tab.status"
          :value="tab.status"
          class="submissions__tab"
        >
          {{ tab.label }}
        </TabsTrigger>
      </TabsList>

      <TabsContent
        v-for="tab in tabs"
        :key="tab.status"
        :value="tab.status"
        class="submissions__panel"
      >
        <SubmissionListItem
          v-for="submission in submissions.toSorted(
            (a: GameSubmissionWithRelations, b: GameSubmissionWithRelations) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )"
          :key="submission.id"
          :game="submission"
          :is-pending="tab.status === 'pending'"
          @refresh="refresh"
        />

        <p
          v-if="submissions.length === 0"
          class="submissions__empty"
        >
          No {{ tab.label }} submissions found.
        </p>
      </TabsContent>
    </TabsRoot>
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
