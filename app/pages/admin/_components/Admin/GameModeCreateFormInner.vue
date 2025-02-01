<script setup lang="ts">
import slugify from "slugify";

import type { InsertGameMode } from "~~/server/db/schema";

type Props = {
  modelValue: Pick<InsertGameMode, "name" | "slug">;
  errors?: Record<string, string>;
};

type Emits = {
  (e: "update:modelValue", value: Props["modelValue"]): void;
};

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const modelValue = computed<Props["modelValue"]>({
  get: () => props.modelValue,
  set: value => emit("update:modelValue", value),
});

function handleNameChange(event: Event) {
  const input = event.target as HTMLInputElement;
  modelValue.value.name = input.value;
  modelValue.value.slug = slugify(input.value, { lower: true });
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
        :class="{ 'tw:border-red-500': errors?.name }"
        @input="handleNameChange"
      />
      <p
        v-if="errors?.name"
        class="tw:text-sm tw:text-red-500"
      >
        {{ errors.name }}
      </p>
    </div>

    <div class="tw:flex tw:flex-col tw:gap-1">
      <label for="slug">Slug</label>
      <input
        id="slug"
        v-model="modelValue.slug"
        type="text"
        class="tw:rounded-lg"
        :class="{ 'tw:border-red-500': errors?.slug }"
      />
      <p
        v-if="errors?.slug"
        class="tw:text-sm tw:text-red-500"
      >
        {{ errors.slug }}
      </p>
    </div>
  </div>
</template>
