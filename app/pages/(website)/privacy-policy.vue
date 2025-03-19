<script setup lang="ts">
import { usePrismic } from "@prismicio/vue";

import ProseSection from "~/slices/ProseSection/index.vue";
import type { ProsePageDocument } from "~~/prismicio-types";

definePageMeta({
  name: "PrivacyPolicyPage",
});

useSeoMeta({
  title: "Privacy Policy - GodoPlay",
  description:
    "Privacy Policy for GodoPlay - An overview of our methods for the collection, utilization, and safeguarding of your personal information.",
  ogTitle: "Privacy Policy - GodoPlay",
  ogDescription:
    "Privacy Policy for GodoPlay - An overview of our methods for the collection, utilization, and safeguarding of your personal information.",
  ogImage: "/og_img.jpg",
  ogUrl: "https://godo-play.com/privacy-policy",
  twitterCard: "summary_large_image",
  twitterTitle: "Privacy Policy - GodoPlay",
  twitterDescription:
    "Privacy Policy for GodoPlay - An overview of our methods for the collection, utilization, and safeguarding of your personal information.",
  twitterImage: "/og_img.jpg",
});

useHead({
  link: [
    {
      rel: "canonical",
      href: "https://godo-play.com/privacy-policy",
    },
  ],
});

const { client } = usePrismic();

const { data: page } = await useAsyncData("privacy-policy", () =>
  client.getByUID<ProsePageDocument>("prose_page", "privacy-policy")
);

useHead(() => ({
  title: page.value?.data?.meta_title ?? "Privacy Policy",
  meta: [
    {
      name: "description",
      content:
        page.value?.data?.meta_description ??
        "Privacy Policy for GodoPlay - Learn how we collect, use, and protect your information.",
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
