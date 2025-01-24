<script setup lang="ts">
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/vue";

import type {
  GameSubmissionResponse,
  GameSubmissionWithRelations,
} from "~~/shared/types/submissions";

definePageMeta({
  name: "AdminGameSubmissionsPage",
});

const { data: submissions, refresh } =
  await useFetch<GameSubmissionResponse>("/api/submissions");

const tabs = [
  { name: "Pending", status: "pending" },
  { name: "Approved", status: "approved" },
  { name: "Rejected", status: "rejected" },
] as const;

const groupedSubmissions = computed(() => {
  const initial: Record<
    "pending" | "approved" | "rejected",
    GameSubmissionWithRelations[]
  > = {
    pending: [],
    approved: [],
    rejected: [],
  };

  if (!submissions.value) {
    return initial;
  }

  return submissions.value?.reduce((acc, submission) => {
    acc[submission.status].push(submission);
    return acc;
  }, initial);
});
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

    <TabGroup
      as="div"
      class="submissions"
    >
      <TabList class="submissions__tab-list">
        <Tab
          v-for="tab in tabs"
          :key="tab.status"
          v-slot="{ selected }"
          as="template"
        >
          <button
            :class="[
              'submissions__tab',
              selected && 'submissions__tab--selected',
            ]"
          >
            {{ tab.name }}
          </button>
        </Tab>
      </TabList>

      <TabPanels class="submissions__panels">
        <TabPanel
          v-for="tab in tabs"
          :key="tab.status"
          class="submissions__panel"
        >
          <SubmissionListItem
            v-for="submission in groupedSubmissions[tab.status]"
            :key="submission.id"
            :game="submission"
            :is-pending="tab.status === 'pending'"
            @refresh="refresh"
          />

          <p
            v-if="groupedSubmissions[tab.status]?.length === 0"
            class="submissions__empty"
          >
            No {{ tab.status }} submissions found.
          </p>
        </TabPanel>
      </TabPanels>
    </TabGroup>
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

  &__tab {
    flex: 1;
    padding-block: 0.625rem;
    padding-inline: 1rem;

    &--selected {
      background-color: white;
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
