<script setup lang="ts">
import {
  Dialog,
  DialogDescription,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

interface Props {
  /** Title of the modal */
  title?: string;
  /** Description of the modal */
  description?: string;
  /** Whether to show the close button */
  showClose?: boolean;
  /** Width class for the modal panel */
  maxWidth?: string;
  /** Whether to show the title */
  showTitle?: boolean;
}

withDefaults(defineProps<Props>(), {
  title: "",
  description: "",
  showClose: true,
  maxWidth: "100%",
  showTitle: true,
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
            v-if="showTitle || showClose"
            class="modal__header"
          >
            <div>
              <DialogTitle
                v-if="title"
                as="h3"
                class="modal__title"
                :class="[!showTitle && 'tw:sr-only']"
              >
                {{ title }}
              </DialogTitle>
              <DialogDescription
                v-if="description"
                class="modal__description"
              >
                {{ description }}
              </DialogDescription>
            </div>

            <CloseButton
              v-if="showClose"
              @click="handleClose"
            />
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
