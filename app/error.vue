<script setup lang="ts">
import type { NuxtError } from "#app";

interface ErrorOptions {
  redirect?: string;
}

defineProps({
  error: {
    type: Object as () => NuxtError,
    default: () => ({}),
  },
});

function handleError(options?: ErrorOptions) {
  clearError({
    redirect: options?.redirect ?? "/",
  });
}
</script>

<template>
  <NuxtLayout name="error">
    <div class="error-page">
      <div class="error-page__content">
        <template v-if="error.statusCode === 404">
          <h1 class="error-page__title">404</h1>
          <h2 class="error-page__subtitle">Page Not Found</h2>
          <p class="error-page__message">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </template>
        <template v-else>
          <h1 class="error-page__title">{{ error.statusCode }}</h1>
          <h2 class="error-page__subtitle">Something went wrong</h2>
          <div class="error-page__message">
            <pre class="tw:text-sm">{{ error.message }}</pre>
          </div>
          <p class="error-page__description">
            Our team has been notified and we're working on fixing this issue.
          </p>
        </template>
      </div>

      <div class="error-page__actions">
        <TheButton
          variant="primary"
          @click="() => handleError({ redirect: '/games' })"
        >
          Browse Games
        </TheButton>
        <TheButton
          variant="secondary"
          @click="() => handleError()"
        >
          Return Home
        </TheButton>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped lang="scss">
.error-page {
  &__content {
    margin-block-end: 2rem;
  }

  &__title {
    font-size: 3.75rem;
    line-height: 1;
    font-weight: 700;
    color: var(--tw-primary-600);
    margin-block-end: 1rem;
  }

  &__subtitle {
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: 600;
    color: var(--tw-gray-900);
    margin-block-end: 0.5rem;
  }

  &__message {
    font-size: 1.125rem;
    line-height: 1.75rem;
    color: var(--tw-gray-600);
    margin-block-end: 0.5rem;
    overflow: auto;
  }

  &__description {
    color: var(--tw-gray-500);
  }

  &__actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
}
</style>
