<script setup lang="ts">
import type { Tag } from "~~/server/db/schema";

import AdminTagCreateForm from "../_components/Admin/TagCreateForm.vue";
import TagUpdateForm from "../_components/Admin/TagUpdateForm.vue";
import { useTags } from "../_composables/useTags";

definePageMeta({
  name: "AdminTagsPage",
});

const { data, status: tagsStatus, refresh } = useTags();

const pending = computed(() => tagsStatus.value === "pending");

// Table configuration
interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  formatter?: (item: T) => string;
  width?: string;
  align?: "left" | "center" | "right";
}

// Define columns for the Tags table
const columns = ref<Column<Tag>[]>([
  {
    key: "name",
    label: "Name",
    sortable: true,
  },
  {
    key: "slug",
    label: "Slug",
  },
  {
    key: "weight",
    label: "Weight",
    sortable: true,
  },
  {
    key: "createdAt",
    label: "Created",
    sortable: true,
    formatter: item =>
      item.createdAt
        ? new Intl.DateTimeFormat(navigator?.language || "en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(item.createdAt))
        : "N/A",
  },
  {
    key: "actions",
    label: "Actions",
    align: "right",
    width: "100px",
  },
]);

// Sorting options
type SortField = "name" | "weight" | "createdAt";
type SortOrder = "asc" | "desc";

const sortField = ref<SortField>("createdAt");
const sortOrder = ref<SortOrder>("desc");

// Computed sorted tags
const tags = computed(() => {
  if (!data.value) {
    return [];
  }

  return [...data.value].sort((a, b) => {
    if (sortField.value === "name") {
      return sortOrder.value === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortField.value === "weight") {
      return sortOrder.value === "asc"
        ? a.weight - b.weight
        : b.weight - a.weight;
    } else if (sortField.value === "createdAt") {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortOrder.value === "asc" ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });
});

// Toggle sort order for a field
function toggleSort(field: SortField) {
  if (sortField.value === field) {
    // Toggle sort order if same field
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    // Set new field and default to ascending
    sortField.value = field as SortField;
    sortOrder.value = "asc";
  }
}

// Cell value getter
function getCellValue(item: Tag, column: Column<Tag>) {
  if (column.key === "actions") {
    return null;
  }

  if (column.formatter) {
    return column.formatter(item);
  }

  // Handle nested properties like 'user.name'
  if (typeof column.key === "string" && column.key.includes(".")) {
    const keys = column.key.split(".");
    let value = item as any;

    for (const key of keys) {
      if (value === undefined || value === null) {
        return "";
      }
      value = value[key];
    }

    return value;
  }

  return item[column.key as keyof Tag];
}

const toast = useToast();
const isCreateModalOpen = ref(false);
const isUpdateModalOpen = ref(false);
const selectedTag = ref<Tag | null>(null);

async function handleDelete(tagId: number | string, tagName: string) {
  if (!confirm(`Are you sure you want to delete ${tagName}?`)) {
    return;
  }

  try {
    await $fetch(`/api/tags/${tagId}`, {
      method: "DELETE",
    });
    toast.show(`Tag "${tagName}" deleted`, "success");
    await refresh();
  } catch (error) {
    const apiError = extractApiError(error);
    toast.show(apiError?.message || "Failed to delete tag", "error");
  }
}

function openUpdateModal(tag: Tag) {
  selectedTag.value = tag;
  isUpdateModalOpen.value = true;
}
</script>

<template>
  <div class="tw:container">
    <header class="tw:mb-6 tw:flex tw:items-center tw:justify-between">
      <h1>Tags</h1>
      <TheButton @click="isCreateModalOpen = true">
        <Icon
          name="lucide:plus"
          class="icon-plus"
        />
        Add Tag
      </TheButton>
    </header>

    <section>
      <div
        v-if="pending"
        class="loading"
      >
        <Icon
          name="lucide:loader"
          class="loading-icon"
        />
      </div>

      <div
        v-else-if="tags"
        class="table-container"
      >
        <div class="table-wrapper">
          <div class="table-box">
            <table
              v-if="tags.length"
              class="data-table"
            >
              <thead>
                <tr>
                  <th
                    v-for="column in columns"
                    :key="column.key.toString()"
                    :class="[
                      column.sortable ? 'sortable-header' : 'regular-header',
                      column.align === 'right'
                        ? 'text-right'
                        : column.align === 'center'
                          ? 'text-center'
                          : 'text-left',
                    ]"
                    :style="column.width ? { width: column.width } : {}"
                    @click="
                      column.sortable
                        ? toggleSort(column.key as SortField)
                        : null
                    "
                  >
                    <div class="header-content">
                      {{ column.label }}
                      <Icon
                        v-if="column.sortable && sortField === column.key"
                        :name="
                          sortOrder === 'asc'
                            ? 'lucide:chevron-up'
                            : 'lucide:chevron-down'
                        "
                        class="sort-icon"
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in tags"
                  :key="item.id"
                  class="data-row"
                >
                  <td
                    v-for="column in columns"
                    :key="column.key.toString()"
                    :class="[
                      column.key === 'name' ? 'name-cell' : 'cell-text',
                      column.align === 'right'
                        ? 'text-right'
                        : column.align === 'center'
                          ? 'text-center'
                          : 'text-left',
                    ]"
                  >
                    <!-- Action column -->
                    <template v-if="column.key === 'actions'">
                      <div class="action-buttons">
                        <TheButton
                          variant="secondary"
                          size="sm"
                          @click="openUpdateModal(item)"
                        >
                          <Icon
                            name="lucide:edit"
                            class="button-icon"
                          />
                        </TheButton>
                        <TheButton
                          variant="danger"
                          size="sm"
                          @click="handleDelete(item.id, item.name)"
                        >
                          <Icon
                            name="lucide:trash"
                            class="button-icon"
                          />
                        </TheButton>
                      </div>
                    </template>

                    <!-- Normal data column -->
                    <template v-else>
                      {{ getCellValue(item, column) }}
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
            <p
              v-else
              class="empty-message"
            >
              No tags found
            </p>
          </div>
        </div>
      </div>
    </section>

    <TheModal
      v-model:open="isCreateModalOpen"
      max-width="768px"
      title="Create A Tag"
    >
      <AdminTagCreateForm @close="isCreateModalOpen = false" />
    </TheModal>

    <TheModal
      v-if="selectedTag"
      v-model:open="isUpdateModalOpen"
      max-width="768px"
      :title="`Update ${selectedTag.name}`"
    >
      <TagUpdateForm
        :tag="selectedTag"
        @close="isUpdateModalOpen = false"
      />
    </TheModal>
  </div>
</template>

<style scoped>
.icon-plus {
  margin-left: -0.25rem;
  margin-right: 0.5rem;
}

.sort-controls {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 1rem;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.table-container {
  overflow-x: auto;
}

.table-wrapper {
  display: inline-block;
  min-width: 100%;
  vertical-align: middle;
}

.table-box {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.data-table {
  min-width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #6b7280;
}

.text-left {
  text-align: left;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.sortable-header {
  cursor: pointer;
}

.sortable-header:hover {
  background-color: #f3f4f6;
}

.header-content {
  display: flex;
  align-items: center;
}

.sort-icon {
  height: 0.75rem;
  width: 0.75rem;
  margin-left: 0.25rem;
}

.data-table td {
  padding: 0.5rem 1rem;
  white-space: nowrap;
}

.data-row {
  border-top: 1px solid #e5e7eb;
}

.data-row:hover {
  background-color: #f9fafb;
}

.name-cell {
  font-weight: 500;
  color: #111827;
}

.cell-text {
  font-size: 0.75rem;
  color: #6b7280;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
}

.button-icon {
  height: 1rem;
  width: 1rem;
}

.empty-message {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
}
</style>
