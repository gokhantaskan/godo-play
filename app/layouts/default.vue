<template>
  <div class="default-layout">
    <AppNavbar />
    <div class="default-layout__content">
      <slot />
    </div>
    <AppFooter />
  </div>
</template>

<style lang="scss" scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__content {
    flex: 1;
    padding-block-end: calc(var(--tw-spacing) * 8);
  }
}
</style>
