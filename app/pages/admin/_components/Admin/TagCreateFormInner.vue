<script setup lang="ts">
import slugify from "slugify";

import type { InsertTag } from "~~/server/db/schema";

type Props = {
  modelValue: Pick<InsertTag, "name" | "slug">;
  autoSlugify?: boolean;
};

type Emits = {
  (e: "update:modelValue", value: Props["modelValue"]): void;
};

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isSlugTouched = ref(false);

const modelValue = computed<Props["modelValue"]>({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value),
});

function handleNameChange(event: Event) {
  const input = event.target as HTMLInputElement;
  modelValue.value.name = input.value;

  if (props.autoSlugify && !isSlugTouched.value) {
    modelValue.value.slug = slugify(input.value, { lower: true });
  }
}
</script>

<template>
  <div class="tw:space-y-4">
    <div class="tw:flex tw:flex-col tw:gap-1">
      <label for="name">Name</label>
      <input
        id="name"
        v-model="modelValue.name"
        type="text"
        class="tw:rounded-lg"
        @input="handleNameChange"
      />
    </div>

    <div class="tw:flex tw:flex-col tw:gap-1">
      <label for="slug">Slug</label>
      <input
        id="slug"
        v-model="modelValue.slug"
        type="text"
        class="tw:rounded-lg"
        @focus="isSlugTouched = true"
      />
    </div>
  </div>
</template>
