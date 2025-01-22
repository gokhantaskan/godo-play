<script setup lang="ts">
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/vue";

import type {
  Submission,
  SubmissionResponse,
} from "~~/shared/schemas/submission";

const { data: submissions } =
  await useFetch<SubmissionResponse>("/api/submissions");

const tabs = [
  { name: "Pending", status: "pending" },
  { name: "Approved", status: "approved" },
  { name: "Rejected", status: "rejected" },
] as const;

const groupedSubmissions = computed(() => {
  const initial: Record<"pending" | "approved" | "rejected", Submission[]> = {
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
    <h1 class="page-title">Submissions</h1>

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
          <div
            v-for="submission in groupedSubmissions[tab.status]"
            :key="submission.id"
            class="submission-card"
          >
            <div class="submission-card__image">
              <NuxtImg
                :src="`https://images.igdb.com/igdb/image/upload/t_cover_small/${submission.gameImageId}.jpg`"
                :alt="submission.gameName"
              />
            </div>
            <div class="submission-card__content">
              <h2 class="submission-card__title">{{ submission.gameName }}</h2>
              <p class="submission-card__meta">ID: {{ submission.id }}</p>
              <p class="submission-card__meta">
                Submitted:
                {{
                  new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(submission.createdAt))
                }}
              </p>
            </div>
          </div>

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

.submission-card {
  --card-spacing: 0.75rem;
  --image-width: 4rem;

  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--card-spacing);
  padding: var(--card-spacing);
  background-color: white;
  border-radius: var(--tw-radius-md);
  border: 1px solid var(--tw-color-border);

  &__image {
    img {
      aspect-ratio: 3/4;
      // width: 100%;
      // height: auto;
      object-fit: cover;
      border-radius: var(--tw-radius-sm);
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.1);
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__title {
    font-size: 1rem;
    font-weight: 500;
    color: var(--tw-color-text);
    line-height: 1.25;
  }

  &__meta {
    font-size: 0.875rem;
    color: var(--tw-color-text-muted);
    line-height: 1.25;
  }
}
</style>
