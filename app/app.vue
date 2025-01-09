<script setup lang="ts">
import { Analytics } from "@vercel/analytics/nuxt";

const isProd = toRef(() => import.meta.env.PROD);

useHead({
  htmlAttrs: {
    lang: "en",
  },
});

useSeoMeta({
  title: "GōdōPlay - The Ultimate Fusion for Co-Op and Multiplayer Gaming",
  description:
    "Find the best cross-platform games for PC, PlayStation, Xbox, and Nintendo Switch. Discover multiplayer, cooperative, and competitive games to play together or against friends, no matter your platform.",
  ogTitle: "GōdōPlay - The Ultimate Fusion for Co-Op and Multiplayer Gaming",
  ogDescription:
    "Find the best cross-platform games for PC, PlayStation, Xbox, and Nintendo Switch.",
  // ogImage: "/og-image.jpg",
  twitterCard: "summary_large_image",
  twitterTitle: "GōdōPlay - Find Cross-Platform Multiplayer Games",
  twitterDescription:
    "Discover the best multiplayer and co-op games across PC, PlayStation, Xbox, and Nintendo Switch.",
  // twitterImage: "/og-image.jpg",
});
</script>

<template>
  <NuxtLoadingIndicator />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <template v-if="isProd">
    <Analytics />
  </template>
</template>
