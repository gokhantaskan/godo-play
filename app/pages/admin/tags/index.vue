<script setup lang="ts">
import AdminTagCreateForm from "../_components/Admin/TagCreateForm.vue";
import AdminTagListItem from "../_components/Admin/TagListItem.vue";
import { useTags } from "../_composables/useTags";

definePageMeta({
  name: "AdminTagsPage",
});

const { data: tags, status: tagsStatus } = useTags();
const pending = computed(() => tagsStatus.value === "pending");

const isCreateModalOpen = ref(false);
</script>

<template>
  <div class="tw:container">
    <header class="tw:mb-6 tw:flex tw:items-center tw:justify-between">
      <h1 class="tw:text-2xl tw:font-bold">Tags</h1>
      <TheButton @click="isCreateModalOpen = true">
        <Icon
          name="lucide:plus"
          class="tw:-ml-1 tw:mr-2"
        />
        Add Tag
      </TheButton>
    </header>

    <section>
      <div
        v-if="pending"
        class="tw:flex tw:items-center tw:justify-center"
      >
        <Icon
          name="lucide:loader"
          class="tw:animate-spin"
        />
      </div>

      <div
        v-else-if="tags"
        role="list"
        class="tw:space-y-4"
      >
        <template v-if="tags.length">
          <AdminTagListItem
            v-for="tag in tags"
            :key="tag.id"
            :tag="tag"
          />
        </template>
        <template v-else>
          <p class="tw:text-center tw:text-gray-500">No tags found</p>
        </template>
      </div>
    </section>

    <TheModal
      v-model:open="isCreateModalOpen"
      max-width="768px"
      title="Create A Tag"
    >
      <AdminTagCreateForm @close="isCreateModalOpen = false" />
    </TheModal>
  </div>
</template>
