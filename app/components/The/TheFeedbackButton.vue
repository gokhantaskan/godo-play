<script setup lang="ts">
import { nextTick, ref } from "vue";

const buttonRef = useTemplateRef("buttonRef");
const dialogRef = useTemplateRef("dialogRef");
const isDialogOpen = ref(false);

function openFeedback() {
  isDialogOpen.value = true;
  // Need to wait for next tick to ensure dialog is mounted
  nextTick(() => {
    dialogRef.value?.showModal();
  });

  if (import.meta.client) {
    document.body.style.overflow = "hidden";
  }
}

function closeFeedback() {
  isDialogOpen.value = false;
  dialogRef.value?.close();

  if (import.meta.client) {
    document.body.style.overflow = "auto";
  }
}
</script>

<template>
  <div class="feedback-button">
    <button
      ref="buttonRef"
      class="feedback-button__button"
      @click="openFeedback"
    >
      <span class="tw:inline-block">Feedback</span>
    </button>
    <dialog
      v-if="isDialogOpen"
      ref="dialogRef"
      class="feedback-button__dialog"
      @close="closeFeedback"
    >
      <header class="feedback-button__header">
        <h2 class="feedback-button__title">Feedback</h2>
        <CloseButton
          class="tw:size-8"
          @click="closeFeedback"
          >Close</CloseButton
        >
      </header>
      <div class="feedback-button__body">
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSf9bHnfnvbM6nFT89ToeckRGei0FuzhWghG2tw4qarS8ft63A/viewform?embedded=true"
          width="100%"
          height="100%"
          frameborder="0"
          marginheight="0"
          marginwidth="0"
          >Yükleniyor…</iframe
        >
      </div>
    </dialog>
  </div>
</template>

<style scoped lang="scss">
.feedback-button {
  --width: 27px;

  position: fixed;
  inset-block: 0;
  inset-inline-end: 0;
  z-index: 1000;

  &__button {
    position: absolute;
    top: 50%;
    right: 0;
    inline-size: fit-content;
    transform-origin: bottom right;
    transform: rotate(270deg) translate(50%);
    border: none;
    border-radius: var(--tw-radius-md);
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    color: white;
    background-color: var(--tw-color-primary);
    padding-inline: calc(var(--tw-spacing) * 4);
    padding-block: calc(var(--tw-spacing) * 1);
  }

  &__dialog {
    border: none;
    border-radius: var(--tw-radius-md);
    margin: auto;
    width: 100%;
    max-width: var(--tw-breakpoint-md);
    height: 100%;
    overflow: hidden;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  &__header {
    padding: 1rem;
    border-bottom: 1px solid var(--tw-color-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    margin-block-end: 0;
  }

  &__body {
    padding: 1rem;
    padding-inline: 0;
    flex: 1;
    // background-color: var(--tw-color-bg);
  }
}
</style>
