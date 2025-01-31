<script setup lang="ts">
interface Props {
  size?: "sm" | "md" | "lg";
}

const { size = "md " } = defineProps<Props>();

const sizeClass = computed(() => {
  return {
    [`close-button--${size}`]: size,
  };
});
</script>

<template>
  <button
    class="close-button"
    :class="sizeClass"
    type="button"
  >
    <Icon
      class="close-button__icon"
      name="lucide:x"
    />
  </button>
</template>
