<template>
  <article
    class="game-card-skeleton"
    aria-hidden="true"
  >
    <div class="game-card-skeleton__cover" />
    <div class="game-card-skeleton__content">
      <div class="game-card-skeleton__title" />
      <div class="game-card-skeleton__modes" />
      <div class="game-card-skeleton__tags">
        <div class="game-card-skeleton__tag" />
        <div class="game-card-skeleton__tag game-card-skeleton__tag--short" />
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

$shimmer-bg: linear-gradient(
  90deg,
  var(--tw-color-border) 25%,
  color-mix(in oklab, var(--tw-color-border) 50%, white) 50%,
  var(--tw-color-border) 75%
);

.game-card-skeleton {
  display: flex;
  flex-direction: column;

  &__cover {
    aspect-ratio: 540 / 720;
    border-radius: var(--tw-radius-lg);
    background: $shimmer-bg;
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }

  &__content {
    padding: 0.5rem 0.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__title {
    height: 1.25rem;
    width: 75%;
    border-radius: var(--tw-radius-sm);
    background: $shimmer-bg;
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
    animation-delay: 0.1s;
  }

  &__modes {
    height: 0.75rem;
    width: 50%;
    border-radius: var(--tw-radius-sm);
    background: $shimmer-bg;
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
    animation-delay: 0.2s;
  }

  &__tags {
    display: flex;
    gap: 0.25rem;
  }

  &__tag {
    height: 1.25rem;
    width: 3.5rem;
    border-radius: var(--tw-radius-sm);
    background: $shimmer-bg;
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
    animation-delay: 0.3s;

    &--short {
      width: 2.5rem;
      animation-delay: 0.35s;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .game-card-skeleton {
    &__cover,
    &__title,
    &__modes,
    &__tag {
      animation: none;
      opacity: 0.6;
    }
  }
}
</style>
