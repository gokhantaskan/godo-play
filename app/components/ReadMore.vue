<script setup lang="ts">
interface Props {
  lineCount?: number;
  fadeStyle?: "gradient" | "solid";
}

const props = defineProps<Props>();
const model = defineModel<boolean>("open", { required: false, default: false });

const contentRef = ref<HTMLElement>();
const isOverflowing = ref(false);

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 */
function createDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
) {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: Parameters<T>) => {
    const later = () => {
      timeout = undefined;
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };

  debounced.cancel = () => {
    clearTimeout(timeout);
    timeout = undefined;
  };

  return debounced;
}

function checkOverflow() {
  if (!contentRef.value) {
    return;
  }

  const lineHeight = parseInt(getComputedStyle(contentRef.value).lineHeight);
  const maxHeight = (props.lineCount || 3) * lineHeight;

  isOverflowing.value = contentRef.value.scrollHeight > maxHeight;

  // Reset expanded state if content is not overflowing
  if (!isOverflowing.value) {
    model.value = false;
  }
}

// Create debounced version for resize handler
const debouncedCheckOverflow = createDebounce(checkOverflow, 150);

onMounted(() => {
  checkOverflow();
  window.addEventListener("resize", debouncedCheckOverflow);
});

onUnmounted(() => {
  window.removeEventListener("resize", debouncedCheckOverflow);
  debouncedCheckOverflow.cancel();
});
</script>

<template>
  <div class="read-more">
    <div
      ref="contentRef"
      :class="[
        'read-more__content',
        {
          [`read-more__content--fade-${fadeStyle || 'gradient'}`]:
            isOverflowing,
          'read-more__content--expanded': model,
        },
      ]"
      :style="{ '--line-count': props.lineCount || 3 }"
    >
      <slot />
    </div>

    <button
      v-if="isOverflowing"
      type="button"
      class="read-more__button"
      @click="model = !model"
    >
      {{ model ? "Show Less" : "Read More" }}
    </button>
  </div>
</template>

<style scoped lang="scss">
.read-more {
  &__content {
    position: relative;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--line-count);
    overflow: hidden;

    &--fade-gradient {
      mask-image: linear-gradient(
        to bottom,
        black calc(100% - 1.5em),
        transparent 100%
      );
      -webkit-mask-image: linear-gradient(
        to bottom,
        black calc(100% - 1.75em),
        transparent 100%
      );
    }

    &--fade-solid::after {
      content: "";
      position: absolute;
      inset-block-end: 0;
      inset-inline: 0;
      block-size: 1.5rem;
      background: rgb(var(--color-bg, 255 255 255));
      pointer-events: none;
    }

    &--expanded {
      display: block;
      -webkit-line-clamp: unset;
      mask-image: none;
      -webkit-mask-image: none;

      &::after {
        content: none;
      }
    }
  }

  &__button {
    margin-block-start: 0.5rem;
    padding-block: 0.25rem;
    padding-inline: 1rem;
    border: 1px solid currentColor;
    border-radius: 0.25rem;
    background: transparent;
    font-size: 0.875rem;
    cursor: pointer;

    &:hover {
      background-color: rgb(0 0 0 / 0.05);
    }
  }
}
</style>
