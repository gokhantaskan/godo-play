<script setup lang="ts">
import { usePrismic } from "@prismicio/vue";

import ProseSection from "~/slices/ProseSection/index.vue";
import type { ProsePageDocument } from "~~/prismicio-types";

definePageMeta({
  name: "TermsOfServicePage",
});

useHead({
  link: [
    {
      rel: "canonical",
      href: "https://godo-play.com/terms-of-service",
    },
  ],
});

useSeoMeta({
  title: "Terms of Service - GodoPlay",
  description:
    "Terms of Service for GodoPlay - A comprehensive overview of the terms and conditions that govern the usage of our services.",
  ogTitle: "Terms of Service - GodoPlay",
  ogDescription:
    "Terms of Service for GodoPlay - A comprehensive overview of the terms and conditions that govern the usage of our services.",
  ogImage: "/og_img.jpg",
  ogUrl: "https://godo-play.com/terms-of-service",
  twitterCard: "summary_large_image",
  twitterTitle: "Terms of Service - GodoPlay",
  twitterDescription:
    "Terms of Service for GodoPlay - A comprehensive overview of the terms and conditions that govern the usage of our services.",
  twitterImage: "/og_img.jpg",
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
