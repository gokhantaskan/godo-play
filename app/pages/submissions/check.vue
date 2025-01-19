<script setup lang="ts">
import type { GameSubmission } from "~~/shared/types/submissions";

const { data, error, refresh } = await useFetch<{
  submissions: GameSubmission[];
}>("/api/submissions");
</script>

<template>
  <div class="tw:container">
    <header>
      <h1>Cross-Play Games</h1>
      <TheButton @click="refresh">
        <Icon name="lucide:refresh-cw" />
      </TheButton>
    </header>

    <div v-if="error">
      <Icon name="lucide:alert-circle" />
      <span>Failed to load submissions</span>
    </div>

    <div
      v-else-if="data?.submissions?.length"
      class="tw:space-y-4"
    >
      <!-- <pre
        v-for="submission in data.submissions"
        :key="submission.id"
        >{{ submission }}</pre
      > -->
      <CrossPlayGameCard
        v-for="submission in data.submissions"
        :key="submission.id"
        :game="submission"
      />
    </div>

    <p v-else>No submissions found.</p>
  </div>
</template>
