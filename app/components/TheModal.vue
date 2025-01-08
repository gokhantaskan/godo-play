<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/vue";

interface Props {
  /** Title of the modal */
  title?: string;
  /** Whether to show the close button */
  showClose?: boolean;
  /** Width class for the modal panel */
  maxWidth?: string;
}

withDefaults(defineProps<Props>(), {
  title: "",
  showClose: true,
  maxWidth: "100%",
});

const modelValue = defineModel<boolean>("open", {
  required: true,
});

/** Close modal handler */
function handleClose() {
  modelValue.value = false;
}
</script>

<template>
  <Dialog
    as="div"
    :open="modelValue"
    class="modal"
    @close="handleClose"
  >
    <div class="modal__backdrop" />
    <div class="modal__container">
      <div class="modal__wrapper">
        <DialogPanel
          :class="['modal__panel']"
          :style="{
            maxWidth,
          }"
        >
          <header
            v-if="title || showClose"
            class="modal__header"
          >
            <DialogTitle
              v-if="title"
              as="h3"
              class="modal__title"
            >
              {{ title }}
            </DialogTitle>

            <button
              v-if="showClose"
              type="button"
              class="modal__close"
              @click="handleClose"
            >
              <span class="tw:sr-only">Close</span>
              <Icon
                name="lucide:x"
                class="tw:size-6"
              />
            </button>
          </header>

          <div class="modal__content">
            <slot />
          </div>

          <footer
            v-if="$slots.footer"
            class="modal__footer"
          >
            <slot name="footer" />
          </footer>
        </DialogPanel>
      </div>
    </div>
  </Dialog>
</template>
