<script setup lang="ts">
import { Analytics } from "@vercel/analytics/nuxt";

import { useScripts } from "@/composables/useScripts";

const isProd = toRef(() => import.meta.env.PROD);
const { initScripts } = useScripts();

useHead({
  htmlAttrs: {
    lang: "en",
  },
  titleTemplate: titleChunk => {
    return titleChunk
      ? `${titleChunk} - GodoPlay`
      : "GodoPlay - The Ultimate Fusion for Co-Op and Multiplayer Gaming";
  },
});

useSeoMeta({
  title: "GodoPlay - The Ultimate Fusion for Co-Op and Multiplayer Gaming",
  description:
    "Find the best cross-platform games for PC, PlayStation, Xbox, and Nintendo Switch. Discover multiplayer, cooperative, and competitive games to play together or against friends, no matter your platform.",
  ogTitle: "GodoPlay - The Ultimate Fusion for Co-Op and Multiplayer Gaming",
  ogDescription:
    "Find the best cross-platform games for PC, PlayStation, Xbox, and Nintendo Switch.",
  ogImage: "/og_img.jpg",
  ogUrl: "https://godoplay.com",
  twitterCard: "summary_large_image",
  twitterTitle: "GodoPlay - Find Cross-Platform Multiplayer Games",
  twitterDescription:
    "Discover the best multiplayer and co-op games across PC, PlayStation, Xbox, and Nintendo Switch.",
  twitterImage: "/og_img.jpg",
});

onMounted(() => {
  initScripts();
});
</script>

<template>
  <div>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <template v-if="isProd">
      <Analytics />
    </template>
    <TheCookieBanner />
  </div>
</template>
