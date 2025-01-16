<script setup lang="ts">
import type { Content } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/vue";

defineOptions({
  name: "ProseSectionSlice",
});

defineProps(
  getSliceComponentProps<Content.ProseBlockSlice>([
    "slice",
    "index",
    "slices",
    "context",
  ])
);
</script>

<template>
  <article
    class="prose"
    :data-slice-type="slice.slice_type"
    :data-slice-variation="slice.variation"
  >
    <header v-if="slice.primary.title || slice.primary.description">
      <h1
        v-if="slice.primary.title"
        class="prose__title"
      >
        {{ slice.primary.title }}
      </h1>
      <time
        v-if="slice.variation === 'legal' && slice.primary.effective_date"
        :datetime="slice.primary.effective_date"
        class="prose__effective-date"
      >
        Effective Date:
        {{
          new Date(slice.primary.effective_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        }}
      </time>
      <p
        v-if="slice.primary.description"
        class="prose__description"
      >
        {{ slice.primary.description }}
      </p>
    </header>

    <PrismicRichText
      v-if="slice.primary.content"
      :field="slice.primary.content"
    />
  </article>
</template>
