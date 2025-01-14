<script setup lang="ts">
import { useCookieConsent } from "@/composables/useCookieConsent";

const { cookieConsent, isLoading, acceptCookies, rejectCookies } =
  useCookieConsent();

const isVisible = computed(
  () => !isLoading.value && cookieConsent.value === null
);

// Handle escape key to reject cookies
function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && isVisible.value) {
    rejectCookies();
  }
}

// Add and remove event listener
onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <Transition
    enter-active-class="tw:transition tw:duration-200 tw:ease-out"
    enter-from-class="tw:translate-y-full"
    enter-to-class="tw:translate-y-0"
    leave-active-class="tw:transition tw:duration-200 tw:ease-in"
    leave-from-class="tw:translate-y-0"
    leave-to-class="tw:translate-y-full"
  >
    <div
      v-if="isVisible"
      class="cookie-banner"
      role="alertdialog"
      aria-modal="true"
      aria-live="polite"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-description"
    >
      <div class="cookie-banner__content">
        <div class="cookie-banner__text">
          <h2
            id="cookie-banner-title"
            class="cookie-banner__title"
          >
            Cookie Policy
          </h2>
          <p
            id="cookie-banner-description"
            class="cookie-banner__description"
          >
            We use cookies to analyze our traffic and enhance your experience.
            You can choose to accept or reject these cookies. For more
            information, please read our
            <NuxtLink
              to="/privacy-policy"
              class="tw:text-primary tw:underline tw:underline-offset-4"
            >
              Privacy Policy </NuxtLink
            >.
          </p>
        </div>
        <div class="cookie-banner__actions">
          <TheButton
            size="sm"
            variant="secondary"
            aria-label="Reject all cookies and hide banner"
            @click="rejectCookies"
          >
            Reject All
          </TheButton>
          <TheButton
            size="sm"
            aria-label="Accept all cookies and hide banner"
            @click="acceptCookies"
          >
            Accept All
          </TheButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss">
@use "sass:map";
@use "@/assets/styles/abstracts/_variables.scss" as *;

$breakpoint-md: map.get($breakpoints, "md");

.cookie-banner {
  position: fixed;
  inset-block-end: 0;
  inset-inline: 0;
  z-index: 50;
  padding: 1rem;
  background: var(--tw-color-bg);
  border-block-start: 1px solid var(--tw-color-border);

  &__content {
    margin-inline: auto;
    max-width: 80rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @media (min-width: $breakpoint-md) {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  &__text {
    flex: 1;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-block-end: 0.5rem;
  }

  &__description {
    font-size: 0.875rem;
    color: var(--tw-color-text-muted);
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }
}
</style>
