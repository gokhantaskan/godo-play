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
    <AppFooter />
  </div>
</template>

<style scoped lang="scss">
.error-layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;

  &__container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 80ch;
    margin-inline: auto;
    padding-block: 2rem;
    text-align: center;
  }
}
</style>
