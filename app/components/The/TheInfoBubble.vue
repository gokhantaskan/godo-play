<script setup lang="ts">
import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/vue";
import { onClickOutside } from "@vueuse/core";
import { ref } from "vue";

interface Props {
  content: string;
  position?: "top" | "right" | "bottom" | "left";
}

const { content, position = "bottom" } = defineProps<Props>();

const isOpen = ref(false);
const reference = ref<HTMLElement | null>(null);
const floating = ref<HTMLElement | null>(null);
const anchorId = useId();
const popoverId = useId();

const { floatingStyles } = useFloating(reference, floating, {
  placement: position,
  middleware: [offset(8), flip(), shift()],
  whileElementsMounted: autoUpdate,
});

function togglePopover() {
  isOpen.value = !isOpen.value;
}

onClickOutside(
  floating,
  () => {
    if (isOpen.value) {
      isOpen.value = false;
    }
  },
  {
    ignore: [reference],
  }
);
</script>

<template>
  <button
    :id="anchorId"
    ref="reference"
    class="info-bubble__button"
    type="button"
    @click="togglePopover"
  >
    <Icon name="lucide:info" />
  </button>

  <div
    v-show="isOpen"
    :id="popoverId"
    ref="floating"
    class="info-bubble__popover"
    :style="[
      floatingStyles,
      {
        visibility: isOpen ? 'visible' : 'hidden',
        pointerEvents: isOpen ? 'auto' : 'none',
      },
    ]"
    role="tooltip"
    aria-live="polite"
  >
    <div class="tw:p-3 tw:text-sm">
      {{ content }}
    </div>
  </div>
</template>
