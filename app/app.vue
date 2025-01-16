<script setup lang="ts">
import { Analytics } from "@vercel/analytics/nuxt";

import { useScripts } from "@/composables/useScripts";

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

useServerSeoMeta({
  title: "GodoPlay - The Ultimate Fusion for Co-Op and Multiplayer Gaming",
  description:
    "Discover multiplayer and co-op games for PC, PlayStation, Xbox, and Nintendo Switch, perfect for playing together or competing against friends, regardless of your platform.",
  ogTitle: "GodoPlay - The Ultimate Fusion for Co-Op and Multiplayer Gaming",
  ogDescription:
    "Discover multiplayer and co-op games for PC, PlayStation, Xbox, and Nintendo Switch, perfect for playing together or competing against friends, regardless of your platform.",
  ogImage: "/og_img.jpg",
  ogUrl: "https://godoplay.com",
  twitterCard: "summary_large_image",
  twitterTitle: "GodoPlay - Find Cross-Platform Multiplayer Games",
  twitterDescription:
    "Discover multiplayer and co-op games for PC, PlayStation, Xbox, and Nintendo Switch, perfect for playing together or competing against friends, regardless of your platform.",
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
    <template v-if="IS_PROD">
      <Analytics />
    </template>
    <TheCookieBanner />
  </div>
</template>
