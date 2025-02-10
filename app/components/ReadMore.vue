<script setup lang="ts">
interface Props {
  lineCount?: number;
  fadeStyle?: "gradient" | "solid";
}

const props = defineProps<Props>();
const model = defineModel<boolean>("open", { required: false, default: false });

const contentRef = ref<HTMLElement>();
const isOverflowing = ref(false);

function checkOverflow() {
  if (!contentRef.value) {
    return;
  }

  const computedStyle = getComputedStyle(contentRef.value);
  const lineHeight = parseFloat(computedStyle.lineHeight);
  const maxHeight = (props.lineCount || 3) * lineHeight;

  isOverflowing.value = contentRef.value.scrollHeight > maxHeight;

  if (!isOverflowing.value) {
    model.value = false;
  }
}

// Simplified debounce with a longer delay
let debounceTimeout: ReturnType<typeof setTimeout>;
const debouncedCheck = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(checkOverflow, 200);
};

onMounted(() => {
  // Initial check after a short delay to ensure content is rendered
  setTimeout(checkOverflow, 50);

  // Use ResizeObserver for size changes
  const resizeObserver = new ResizeObserver(debouncedCheck);
  resizeObserver.observe(contentRef.value!);

  // Cleanup
  onUnmounted(() => {
    resizeObserver.disconnect();
    clearTimeout(debounceTimeout);
  });
});

// Watch for prop changes
watch(() => props.lineCount, checkOverflow);
</script>

<template>
  <div class="read-more">
    <div
      ref="contentRef"
      :class="[
        'read-more__content',
        {
          [`read-more__content--fade-${fadeStyle || 'gradient'}`]:
            isOverflowing && !model,
          'read-more__content--expanded': model,
        },
      ]"
      :style="{
        '--line-count': props.lineCount || 3,
        '--line-clamp': model ? 'none' : props.lineCount || 3,
      }"
    >
      <slot />
    </div>

    <TheButton
      v-if="isOverflowing"
      size="sm"
      variant="secondary"
      @click="model = !model"
    >
      {{ model ? "Show Less" : "Read More" }}
    </TheButton>
  </div>
</template>

<style scoped lang="scss">
.read-more {
  &__content {
    position: relative;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--line-clamp);
    overflow: hidden;

    &--fade-gradient {
      &:not(.read-more__content--expanded) {
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
    }

    &--fade-solid:not(.read-more__content--expanded)::after {
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

    &:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
  }
}
</style>
