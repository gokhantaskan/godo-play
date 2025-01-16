<script setup lang="ts">
import { usePrismic } from "@prismicio/vue";

import ProseSection from "~/slices/ProseSection/index.vue";
import type { ProsePageDocument } from "~~/prismicio-types";

definePageMeta({
  name: "PrivacyPolicyPage",
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
