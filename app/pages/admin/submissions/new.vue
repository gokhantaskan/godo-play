<script setup lang="ts">
definePageMeta({
  name: "AdminNewGameSubmissionPage",
});
</script>

<template>
  <main class="submit-game">
    <NuxtLink
      class="tw:inline-flex tw:items-center tw:gap-1"
      :to="{ name: 'AdminGameSubmissionsPage' }"
    >
      <Icon name="lucide:arrow-left" /> Back
    </NuxtLink>
    <h1 class="submit-game__title">Submit a Crossplay Support</h1>
    <p class="submit-game__description">
      Help us identify games and their supported crossplay platforms. Specify
      which platforms can play together in groups.
    </p>
    <SubmitGameForm />
  </main>
</template>

<style lang="scss">
.submit-game {
  max-inline-size: 32rem;
  margin-inline: auto;
  padding: 1rem;

  &__title {
    margin-block-end: 0.5rem;
  }

  &__description {
    margin-block-end: 1rem;
  }
}
</style>
