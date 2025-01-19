<script setup lang="ts">
import type { GameSubmission } from "~~/shared/types/submissions";

const { data, error } = await useFetch<{ submissions: GameSubmission[] }>(
  "/api/submissions/check"
);
</script>

<template>
  <div class="tw:container">
    <h1>Cross-Play Games</h1>

    <div v-if="error">
      <Icon name="lucide:alert-circle" />
      <span>Failed to load submissions</span>
    </div>

    <div
      v-else-if="data?.submissions?.length"
      class="tw:space-y-4"
    >
      <CrossPlayGameCard
        v-for="submission in data.submissions"
        :key="submission.id"
        :game="submission"
      />
    </div>

    <p v-else>No submissions found.</p>
  </div>
</template>
