<script setup lang="ts">
import type { Tag } from "~~/server/db/schema";

import { useTags } from "../../_composables/useTags";
import AdminTagCreateFormInner from "./TagCreateFormInner.vue";

type TagFormData = {
  name: string;
  slug: string;
  weight: number;
};

const props = defineProps<{
  tag: Tag;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { refresh } = useTags();
const toast = useToast();
const apiError = useApiError();

const form = reactive<TagFormData>({
  name: props.tag.name,
  slug: props.tag.slug,
  weight: (props.tag as any).weight || 1.0,
});

const pending = ref(false);

async function onSubmit() {
  pending.value = true;
  apiError.clear();

  try {
    await $fetch<Tag>(`/api/tags/${props.tag.id}`, {
      method: "PATCH",
      body: form,
    });

    toast.show("Tag updated", "success");
    await refresh();
    emit("close");
  } catch (err) {
    apiError.set(err);
    toast.show(apiError.message.value || "Failed to update tag", "error");
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <AdminTagCreateFormInner
      v-model="form"
      :errors="apiError.fieldErrors.value"
    />

    <div class="tw:mt-4 tw:flex tw:justify-end tw:gap-2">
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
        Update
      </TheButton>
    </div>
  </form>
</template>
