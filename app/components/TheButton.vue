<script setup lang="ts">
interface Props {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  disabled: false,
});

const buttonClasses = computed(() => [
  "button",
  `button--${props.variant}`,
  `button--${props.size}`,
]);
</script>

<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>
