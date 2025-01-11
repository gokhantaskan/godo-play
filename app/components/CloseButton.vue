<script setup lang="ts">
interface Props {
  size?: "sm" | "md" | "lg";
}

const { size = "md " } = defineProps<Props>();

const sizeClass = computed(() => {
  return {
    "close-button--sm": size === "sm",
    "close-button--md": size === "md",
    "close-button--lg": size === "lg",
  };
});
</script>

<template>
  <button
    class="close-button"
    :class="sizeClass"
  >
    <Icon name="lucide:x" />
  </button>
</template>
