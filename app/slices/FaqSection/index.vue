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

const id = useId();

// Add event listeners for exclusive accordion behavior
onMounted(() => {
  const wrapper = document.getElementById(id);
  const details = wrapper?.querySelectorAll<HTMLDetailsElement>(".faq__item");

  details?.forEach(detail => {
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
    :id
    :data-slice-type="slice.slice_type"
    :data-slice-variation="slice.variation"
    class="faq tw:container tw:max-w-screen-lg"
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
      <div>
        <PrismicRichText
          v-if="slice.primary.section_description"
          class="faq__description"
          :field="slice.primary.section_description"
        />
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
          <PrismicRichText :field="item.content" />
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

  &__header {
    margin-block-end: var(--spacing);
    text-align: start;
  }

  &__title {
    font-size: 2rem;
    font-weight: 600;
    margin-block-end: 0.5rem;
  }

  &__description {
    font-size: 1.125rem;
    text-wrap: balance;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  // <details>
  &__item {
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    background-color: var(--bg-color);
  }

  // <summary>
  &__button {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing);
    text-align: start;
    gap: 1rem;
    cursor: pointer;
    list-style: none;
    border-top-left-radius: var(--radius);
    border-top-right-radius: var(--radius);

    &::-webkit-details-marker {
      display: none;
    }
  }

  &__question {
    font-weight: 600;
  }

  &__icon {
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
    color: var(--tw-color-text-muted);
    transition: transform 0.2s ease;
  }

  &__item[open] .faq__icon {
    transform: rotate(-180deg);
  }

  &__panel {
    padding-inline: var(--spacing);
    padding-block-end: var(--spacing);
    color: var(--text-muted);
  }
}
</style>
