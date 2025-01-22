<script setup lang="ts">
import { useCookieConsent } from "@/composables/useCookieConsent";

const route = useRoute();
const dialogRef = ref<HTMLDialogElement | null>(null);

const { cookieConsent, isLoading, acceptCookies, rejectCookies } =
  useCookieConsent();

const isLegalPage = computed(() => {
  const legalRoutes = [
    "/privacy-policy",
    "/terms-of-service",
    "/cookie-policy",
  ];
  return legalRoutes.includes(route.path);
});

const shouldShow = computed(() => {
  // Don't show on legal pages
  if (isLegalPage.value) {
    return false;
  }

  // Always hide while loading
  if (isLoading.value) {
    return false;
  }

  // Only show if no consent is set
  return cookieConsent.value === null;
});

// Add mounted state to prevent flash
const isMounted = ref(false);
onMounted(() => {
  dialogRef.value?.addEventListener("cancel", preventDefaultCancel);
  // Set mounted after a tick to ensure cookie is checked
  nextTick(() => {
    isMounted.value = true;
  });
});

function handleAccept() {
  acceptCookies();
}

function handleReject() {
  rejectCookies();
}

function preventDefaultCancel(e: Event) {
  e.preventDefault();
}

onBeforeUnmount(() => {
  dialogRef.value?.removeEventListener("cancel", preventDefaultCancel);
});

watchEffect(() => {
  if (!dialogRef.value || !isMounted.value) {
    return;
  }

  if (shouldShow.value) {
    dialogRef.value.showModal();
  } else {
    dialogRef.value.close();
  }
});
</script>

<template>
  <dialog
    ref="dialogRef"
    class="cookie-banner"
    @click="e => e.target === dialogRef"
    @keydown.esc.prevent
  >
    <div
      tabindex="0"
      class="cookie-banner__content tw:shadow-md"
    >
      <div class="cookie-banner__text">
        <h2 class="cookie-banner__title">Cookie Policy</h2>
        <p class="cookie-banner__description">
          We use cookies to analyze our traffic and enhance your experience. You
          can choose to accept or reject these cookies. For more information,
          please read our
          <NuxtLink to="/privacy-policy">Privacy Policy</NuxtLink>.
        </p>
      </div>
      <div class="cookie-banner__actions">
        <TheButton
          size="sm"
          @click="handleAccept"
        >
          Accept
        </TheButton>
        <TheButton
          size="sm"
          variant="secondary"
          @click="handleReject"
        >
          Decline
        </TheButton>
      </div>
    </div>
  </dialog>
</template>

<style lang="scss">
@use "sass:map";
@use "@/assets/styles/abstracts/_variables.scss" as *;

.cookie-banner {
  --edge-offset: 1rem;
  padding: var(--edge-offset);
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  background: transparent;
  border: none;

  &::backdrop {
    background: color-mix(in srgb, var(--tw-color-text-dark) 10%, transparent);
    pointer-events: none;
    border: none;
  }

  &__content {
    position: fixed;
    inset-inline: 0;
    inset-block-end: 0;
    max-width: map.get($breakpoints, "md");
    margin-inline: auto;
    padding: 1.5rem;
    border-radius: var(--tw-radius-lg) var(--tw-radius-lg) 0 0;
    display: flex;
    flex-direction: column;
    gap: var(--edge-offset);
    background: white;

    @media (min-width: map.get($breakpoints, "md")) {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      border-radius: var(--tw-radius-lg);
      inset: auto var(--edge-offset) var(--edge-offset);
    }
  }

  &__text {
    flex: 1;
  }

  &__title {
    font-size: 1.125rem;
    font-weight: 600;
    margin-block-end: 0.5rem;
  }

  &__description {
    font-size: 0.875rem;
  }

  &__actions {
    display: flex;
    flex-direction: row-reverse;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  &__button--flash {
    animation: flash 0.3s ease 2;
  }
}

@keyframes flash {
  0%,
  100% {
    opacity: 1;
    scale: 1;
  }
  50% {
    opacity: 0.88;
    scale: 0.98;
  }
}
</style>
