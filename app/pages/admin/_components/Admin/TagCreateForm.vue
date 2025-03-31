<script setup lang="ts">
import type { InsertTag, Tag } from "~~/server/db/schema";

import { useTags } from "../../_composables/useTags";
import AdminTagCreateFormInner from "./TagCreateFormInner.vue";

const emit = defineEmits<{
  close: [];
}>();

const { refresh } = useTags();

const form = reactive<Pick<InsertTag, "name" | "slug">>({
  name: "",
  slug: "",
});

const pending = ref(false);

async function onSubmit() {
  pending.value = true;

  try {
    await $fetch<Tag>("/api/tags", {
      method: "POST",
      body: form,
    });

    await refresh();
    emit("close");
  } catch (err) {
    alert(JSON.stringify(err));
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <form
    novalidate
    class="tw:flex tw:flex-col tw:gap-4"
    @submit.prevent="onSubmit"
  >
    <AdminTagCreateFormInner
      v-model="form"
      auto-slugify
    />

    <div class="tw:flex tw:justify-end tw:gap-2">
      <TheButton
        type="button"
        variant="secondary"
        @click="$emit('close')"
      >
        Cancel
      </TheButton>
      <TheButton
        type="submit"
        :loading="pending"
      >
        Create
      </TheButton>
    </div>
  </form>
</template>
