<script setup lang="ts">
import type { Content } from "@prismicio/client";

import type { TheButtonProps } from "~/components/The/TheButton.vue";

// The array passed to `getSliceComponentProps` is purely optional.
// Consider it as a visual hint for you when templating your slice.
const { slice } = defineProps(
  getSliceComponentProps<Content.ExplanatorySectionSlice>([
    "slice",
    "index",
    "slices",
    "context",
  ])
);

const wrapperClasses = computed(() => {
  switch (slice.variation) {
    case "rightImage":
      return "explanatory-section--image-right";
    case "centered":
      return "explanatory-section--centered";
    default:
      return "";
  }
});

const textContentClasses = computed(() => {
  switch (slice.primary.content_size) {
    case "small":
      return "explanatory-section--small";
    case "large":
      return "explanatory-section--large";
    default:
      return "";
  }
});

function getUrl(
  cta: Content.ExplanatorySectionSliceDefault["primary"]["cta_text"][number]
) {
  // @ts-ignore - URL is not available in the type
  return cta.url;
}
</script>

<template>
  <section
    :data-slice-type="slice.slice_type"
    :data-slice-variation="slice.variation"
    class="tw:container tw:max-w-screen-lg explanatory-section"
    :class="[wrapperClasses, textContentClasses]"
  >
    <NuxtImg
      v-if="slice.primary.section_image"
      :src="slice.primary.section_image.url!"
      :alt="slice.primary.section_image.alt ?? ''"
      class="explanatory-section__image"
    />
    <div class="explanatory-section__content">
      <h2 class="explanatory-section__title">{{ slice.primary.title }}</h2>
      <PrismicRichText
        class="explanatory-section__text"
        :field="slice.primary.content"
      />
      <div
        v-if="slice.primary.cta_text.length"
        class="explanatory-section__cta"
      >
        <template
          v-for="(cta, idx) in slice.primary.cta_text"
          :key="idx"
        >
          <NuxtLink
            v-slot="{ href }"
            :to="getUrl(cta)"
            custom
          >
            <TheButton
              as="a"
              :href
              :variant="
                String(cta.variant).toLowerCase() as TheButtonProps['variant']
              "
            >
              {{ cta.text }}
            </TheButton>
          </NuxtLink>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.explanatory-section {
  $root: &;

  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  grid-template-areas: "image content";
  align-items: center;

  &--image-right {
    grid-template-areas: "content image";
  }

  &--centered {
    grid-template-columns: 1fr;
    grid-template-areas:
      "content"
      "image";
    text-align: center;
  }

  &__image {
    grid-area: image;
    border-radius: var(--tw-radius-lg);
    box-shadow: var(--tw-shadow-lg);
    width: 100%;
    margin-inline: auto;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-block-end: 0.5rem;
  }

  &__content {
    grid-area: content;
  }

  &__cta {
    display: flex;
    gap: 0.25rem;
    width: fit-content;
    margin-block-start: 1rem;
    margin-inline: auto;
  }

  @media (max-width: 767.98px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      "content"
      "image";

    &--image-right {
      grid-template-areas:
        "content"
        "image";
    }

    &--centered {
      grid-template-areas:
        "content"
        "image";
    }

    &__title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-block-end: 0.5rem;
    }

    &__cta {
      display: flex;
      gap: 0.25rem;
      width: fit-content;
      margin-block-start: 1rem;
      margin-inline: auto;
    }
  }

  @media (min-width: 768px) {
    &--large {
      #{$root}__title {
        font-size: 1.25rem;
        font-weight: 600;
        margin-block-end: 0.75rem;
      }

      #{$root}__text {
        font-size: 1.125rem;
        line-height: 1.375;
      }

      #{$root}__cta {
        margin-block-start: 0.5rem;
      }
    }
  }
}
</style>
