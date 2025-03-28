<script setup lang="ts">
import { Analytics } from "@vercel/analytics/nuxt";

import { useScripts } from "@/composables/useScripts";
import { useSessionState } from "~/composables/useSessionState";

import { getGameModes, getStores } from "./services/api.service";

const { initScripts } = useScripts();

onMounted(async () => {
  initScripts();

  if (import.meta.client) {
    const { gameModes, stores } = useSessionState();

    if (!gameModes.value.length) {
      gameModes.value = await getGameModes();
    }

    if (!stores.value.length) {
      stores.value = await getStores();
    }
  }
});

useHead({
  htmlAttrs: {
    lang: "en-us",
  },
  titleTemplate: titleChunk => {
    return titleChunk
      ? `${titleChunk} - GodoPlay`
      : "GodoPlay - The Ultimate Fusion for Co-Op and Multiplayer Gaming";
  },
  link: [
    {
      rel: "icon",
      type: "image/svg+xml",
      href: "/favicon.svg",
    },
  ],
  script: [
    {
      src: "https://static.cdn.prismic.io/prismic.js?new=true&repo=godoplay",
      async: true,
      defer: true,
    },
  ],
});

useSeoMeta({
  title: "GodoPlay - The Ultimate Fusion for Co-Op and Multiplayer Gaming",
  description:
    "Discover the best multi-platform and cross-play co-op and multiplayer games for PC, PlayStation, Xbox, and Nintendo Switch—team up or compete with friends on any platform.",
  ogTitle: "GodoPlay - The Ultimate Fusion for Co-Op and Multiplayer Gaming",
  ogDescription:
    "Discover the best multi-platform and cross-play co-op and multiplayer games for PC, PlayStation, Xbox, and Nintendo Switch—team up or compete with friends on any platform.",
  ogImage: "/og_img.jpg",
  ogUrl: "https://godo-play.com",
  twitterCard: "summary_large_image",
  twitterTitle: "The Ultimate Fusion for Co-Op and Multiplayer Gaming",
  twitterDescription:
    "Discover the best multi-platform and cross-play co-op and multiplayer games for PC, PlayStation, Xbox, and Nintendo Switch—team up or compete with friends on any platform.",
  twitterImage: "/og_img.jpg",
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
    <TheFeedbackButton />
  </div>
</template>
