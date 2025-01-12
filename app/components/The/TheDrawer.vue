<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { computed } from "vue";

interface Props {
  side?: "left" | "right" | "top" | "bottom";
  size?: string;
  beforeClose?: (done: (cancel?: boolean) => void) => void;
  title?: string;
  description?: string;
  showClose?: boolean;
  showTitle?: boolean;
}

const isOpen = defineModel<boolean>("open");

const {
  side = "right",
  size = "320px",
  beforeClose,
  title = "",
  description = "",
  showClose = true,
  showTitle = true,
} = defineProps<Props>();

const close = () => {
  if (beforeClose) {
    beforeClose(cancel => {
      if (cancel) return;
      isOpen.value = false;
    });
    return;
  }
  isOpen.value = false;
};

const isVertical = computed(() => side === "top" || side === "bottom");
const panelStyle = computed(() => {
  if (isVertical.value) {
    return { width: "100%", maxHeight: size };
  }

  return { width: "100%", maxWidth: size };
});
</script>

<template>
  <TransitionRoot
    appear
    :show="isOpen"
    as="template"
  >
    <Dialog
      as="div"
      class="drawer"
      @close="close"
    >
      <div class="drawer__container">
        <TransitionChild
          as="template"
          enter-active-class="drawer__backdrop--enter-active"
          enter-from-class="drawer__backdrop--enter-from"
          leave-active-class="drawer__backdrop--leave-active"
          leave-to-class="drawer__backdrop--leave-to"
        >
          <div
            class="drawer__backdrop"
            aria-hidden="true"
            @click="close"
          />
        </TransitionChild>

        <TransitionChild
          as="template"
          enter-active-class="drawer__panel--enter-active"
          enter-from-class="drawer__panel--enter-from"
          leave-active-class="drawer__panel--leave-active"
          leave-to-class="drawer__panel--leave-to"
        >
          <DialogPanel
            class="drawer__panel"
            :class="`drawer__panel--${side}`"
            :style="panelStyle"
          >
            <header
              v-if="$slots.header || showTitle || showClose || title"
              class="drawer__header"
            >
              <slot name="header">
                <div>
                  <DialogTitle
                    v-if="title"
                    as="h3"
                    class="drawer__title"
                    :class="[!showTitle && 'tw:sr-only']"
                  >
                    {{ title }}
                  </DialogTitle>
                  <p
                    v-if="description"
                    class="drawer__description"
                  >
                    {{ description }}
                  </p>
                </div>

                <CloseButton
                  v-if="showClose"
                  @click="close"
                />
              </slot>
            </header>

            <div class="drawer__content">
              <slot />
            </div>

            <footer
              v-if="$slots.footer"
              class="drawer__footer"
            >
              <slot name="footer" />
            </footer>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
