<script setup lang="ts">
import { usePrismic } from "@prismicio/vue";

import ProseSection from "~/slices/ProseSection/index.vue";
import type { ProsePageDocument } from "~~/prismicio-types";

definePageMeta({
  name: "AboutUsPage",
});

useSeoMeta({
  title: "About - GodoPlay",
  description:
    "Discover cross-platform co-op and multiplayer games at GōdōPlay - your ultimate destination to find games tailored to your unique gaming setup across platforms.",
  ogTitle: "About - GodoPlay",
  ogDescription:
    "Discover cross-platform co-op and multiplayer games at GōdōPlay - your ultimate destination to find games tailored to your unique gaming setup across platforms.",
  ogImage: "/og_img.jpg",
  ogUrl: "https://godo-play.com/about",
  twitterCard: "summary_large_image",
  twitterTitle: "About - GodoPlay",
  twitterDescription:
    "Discover cross-platform co-op and multiplayer games at GōdōPlay - your ultimate destination to find games tailored to your unique gaming setup across platforms.",
  twitterImage: "/og_img.jpg",
});

useHead({
  link: [
    {
      rel: "canonical",
      href: "https://godo-play.com/about",
    },
  ],
});

const { client } = usePrismic();

const { data: page } = await useAsyncData("about-us", () =>
  client.getByUID<ProsePageDocument>("prose_page", "about-us")
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
