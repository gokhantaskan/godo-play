<script setup lang="ts">
import type { Tag } from "~~/server/db/schema";

import { useTags } from "../../_composables/useTags";
import TagUpdateForm from "./TagUpdateForm.vue";

const props = defineProps<{
  tag: Tag;
}>();

const { refresh } = useTags();
const toast = useToast();

const isUpdateModalOpen = ref(false);
const isDeleting = ref(false);

async function handleDelete() {
  if (!confirm(`Are you sure you want to delete ${props.tag.name}?`)) {
    return;
  }

  isDeleting.value = true;

  try {
    await $fetch(`/api/tags/${props.tag.id}`, {
      method: "DELETE",
    });
    toast.show(`Tag "${props.tag.name}" deleted`, "success");
    await refresh();
  } catch (error) {
    const apiError = extractApiError(error);
    toast.show(apiError?.message || "Failed to delete tag", "error");
  } finally {
    isDeleting.value = false;
  }
}
</script>

<template>
  <div
    role="listitem"
    class="tw:flex tw:items-center tw:justify-between tw:gap-4 tw:rounded-lg tw:border tw:border-gray-200 tw:p-4"
  >
    <div>
      <h3 class="tw:font-medium">{{ tag.name }}</h3>
      <p class="tw:text-sm tw:text-gray-500">
        {{ tag.slug }} · {{ tag.weight }}
      </p>
    </div>

    <div class="tw:flex tw:items-center tw:gap-2">
      <TheButton
        variant="secondary"
        @click="isUpdateModalOpen = true"
      >
        <Icon name="lucide:edit" />
      </TheButton>
      <TheButton
        variant="danger"
        :loading="isDeleting"
        @click="handleDelete"
      >
        <Icon name="lucide:trash" />
      </TheButton>
    </div>

    <TheModal
      v-model:open="isUpdateModalOpen"
      max-width="768px"
      :title="`Update ${tag.name}`"
    >
      <TagUpdateForm
        :tag="tag"
        @close="isUpdateModalOpen = false"
      />
    </TheModal>
  </div>
</template>
