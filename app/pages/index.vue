<script setup lang="ts">
import { components } from "~/slices";
import type { HomePageDocument } from "~~/prismicio-types";

const prismic = usePrismic();

const { data: page } = await useAsyncData("PrismicHomePage", () =>
  prismic.client.getSingle<HomePageDocument>("home_page")
);

useSeoMeta({
  title: page.value?.data.meta_title,
  ogTitle: page.value?.data.meta_title,
  description: page.value?.data.meta_description,
  ogDescription: page.value?.data.meta_description,
  ogImage: computed(() => prismic.asImageSrc(page.value?.data.meta_image)),
});
</script>

<template>
  <SliceZone
    wrapper="main"
    class="tw:space-y-8"
    :slices="page?.data.slices ?? []"
    :components="components"
  />
</template>
