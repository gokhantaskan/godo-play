<script setup lang="ts">
import { asImageSrc } from "@prismicio/client";

import { components } from "~/slices";
import type { HomePageDocument } from "~~/prismicio-types";

const prismic = usePrismic();

const { data: page } = await useAsyncData("PrismicHomePage", () =>
  prismic.client.getSingle<HomePageDocument>("home_page")
);

useHead({
  link: [
    {
      rel: "canonical",
      href: "https://godo-play.com",
    },
  ],
});

useSeoMeta({
  title: page.value?.data.meta_title,
  ogTitle: page.value?.data.meta_title,
  description: page.value?.data.meta_description,
  ogDescription: page.value?.data.meta_description,
  ogImage: computed(() => asImageSrc(page.value?.data.meta_image)),
});
</script>

<template>
  <SliceZone
    wrapper="main"
    :slices="page?.data.slices ?? []"
    :components="components"
  />
</template>

<style scoped lang="scss">
:deep(section) {
  padding-block: 4rem;
}
</style>
