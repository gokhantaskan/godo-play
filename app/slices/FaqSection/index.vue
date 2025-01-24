<script setup lang="ts">
import type { Content } from "@prismicio/client";

const { slice } = defineProps(
  getSliceComponentProps<Content.FaqSectionSlice>([
    "slice",
    "index",
    "slices",
    "context",
  ])
);

// Add event listeners for exclusive accordion behavior
onMounted(() => {
  const details = document.querySelectorAll<HTMLDetailsElement>(".faq__item");

  details.forEach(detail => {
    detail.addEventListener("toggle", () => {
      if (detail.open) {
        details.forEach(otherDetail => {
          if (otherDetail !== detail && otherDetail.open) {
            otherDetail.open = false;
          }
        });
      }
    });
  });
});
</script>

<template>
  <section
    class="faq tw:container tw:max-w-screen-md"
    :data-slice-type="slice.slice_type"
    :data-slice-variation="slice.variation"
  >
    <header
      v-if="slice.primary.section_title || slice.primary.section_description"
      class="faq__header"
    >
      <h3
        v-if="slice.primary.section_title"
        class="faq__title"
      >
        {{ slice.primary.section_title }}
      </h3>
      <div
        v-if="slice.primary.section_description"
        class="faq__description"
      >
        <PrismicRichText :field="slice.primary.section_description" />
      </div>
    </header>

    <div class="faq__items">
      <details
        v-for="(item, index) in slice.primary.disclosure"
        :key="index"
        class="faq__item"
        name="faq-group"
      >
        <summary class="faq__button">
          <span class="faq__question">{{ item.title }}</span>
          <Icon
            name="lucide:chevron-down"
            class="faq__icon"
            aria-hidden="true"
          />
        </summary>
        <div class="faq__panel">
          <PrismicRichText
            class="prose"
            :field="item.content"
          />
        </div>
      </details>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use "sass:map";
@use "@/assets/styles/abstracts/variables" as *;

.faq {
  --spacing: 1.5rem;
  --radius: var(--tw-radius-lg);
  --border-color: var(--tw-color-border);
  --bg-color: var(--tw-color-bg);
  --text-color: var(--tw-color-text);
  --text-muted: var(--tw-color-text-muted);

  &__header {
    margin-block-end: var(--spacing);
    text-align: center;
  }

  &__title {
    font-size: 2rem;
    font-weight: 600;
    color: var(--text-color);
    margin-block-end: 0.5rem;
  }

  &__description {
    color: var(--text-muted);
    font-size: 1.125rem;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__item {
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    background-color: var(--bg-color);
  }

  &__button {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem;
    text-align: start;
    gap: 1rem;
    cursor: pointer;
    list-style: none;

    &::-webkit-details-marker {
      display: none;
    }
  }

  &__question {
    font-weight: 500;
    color: var(--text-color);
  }

  &__icon {
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
    color: var(--text-muted);
    transition: transform 0.2s ease;
  }

  &__item[open] .faq__icon {
    transform: rotate(-180deg);
  }

  &__panel {
    padding-inline: 1.25rem;
    padding-block-end: 1.25rem;
    color: var(--text-muted);
  }
}
</style>
