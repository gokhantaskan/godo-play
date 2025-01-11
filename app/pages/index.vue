<script setup lang="ts"></script>

<template>
  <main>
    <header class="hero">
      <div class="hero__content">
        <h1 class="hero__title">Find Games You Can Actually Play Together</h1>
        <p class="hero__description">
          Stop wondering which games work across platforms. GōdōPlay helps you
          find and filter multiplayer games regardless of your gaming systems.
        </p>
        <NuxtLink
          v-slot="{ navigate }"
          to="/games"
          custom
        >
          <TheButton
            class="hero__cta"
            size="lg"
            right-icon="lucide:arrow-right"
            @click="navigate"
          >
            Start Discovering
          </TheButton>
        </NuxtLink>
        <PlatformIcons
          class="tw:mt-6"
          use-default-color
        />
      </div>
    </header>
  </main>
</template>

<style scoped lang="scss">
@use "sass:map";
@use "@/assets/styles/abstracts/variables" as *;

$breakpoint-md: map.get($breakpoints, "md");

.hero {
  padding-block: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &__content {
    text-align: center;
    max-width: 60ch;
    padding-inline: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  &__title {
    font-size: 2rem;
    line-height: 105%;
    margin-block-end: 1.5rem;
    font-weight: 600;

    @media (min-width: $breakpoint-md) {
      font-size: 3rem;
    }
  }

  &__description {
    font-size: 1.125rem;
    line-height: 1.25;
    font-weight: 300;

    @media (min-width: $breakpoint-md) {
      font-size: 1.25rem;
    }
  }

  &__cta {
    margin-block-start: 1rem;
  }
}
</style>
