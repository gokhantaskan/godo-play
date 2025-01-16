<script setup lang="ts">
import { usePrismic } from "@prismicio/vue";

import ProseSection from "~/slices/ProseSection/index.vue";
import type { ProsePageDocument } from "~~/prismicio-types";

definePageMeta({
  name: "TermsOfServicePage",
});

const { client } = usePrismic();

const { data: page } = await useAsyncData("terms-of-service", () =>
  client.getByUID<ProsePageDocument>("prose_page", "terms-of-service")
);

useHead(() => ({
  title: page.value?.data?.meta_title ?? "Terms of Service",
  meta: [
    {
      name: "description",
      content:
        page.value?.data?.meta_description ??
        "Terms of Service for GodoPlay - Read our terms and conditions.",
    },
  ],
}));
</script>

<template>
  <main
    role="main"
    class="tw:py-8"
  >
    <div class="tw:container">
      <template v-if="page?.data?.slices">
        <SliceZone
          :slices="page.data.slices"
          :components="{ prose_block: ProseSection }"
        />
      </template>
    </div>
  </main>
</template>
