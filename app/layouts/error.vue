<script setup lang="ts">
// Ensure we're using a dark background for error pages
useHead({
  bodyAttrs: {
    class: "tw:bg-gray-50",
  },
});
</script>

<template>
  <div class="error-layout">
    <div class="error-layout__container">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.error-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding-inline: 1rem;

  &__container {
    width: 100%;
    max-width: 80ch;
    margin-inline: auto;
    text-align: center;
  }
}
</style>
