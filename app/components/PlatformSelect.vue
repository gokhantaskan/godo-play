<script setup lang="ts">
import type { PLATFORMS } from "~~/shared/constants/platforms";

export type SimplePlatform = (typeof PLATFORMS)[number];
export type PlatformId = SimplePlatform["id"];

defineProps<{
  platforms: SimplePlatform[];
  label: string;
  required?: boolean;
}>();

const modelValue = defineModel<PlatformId | null>("modelValue");
</script>

<template>
  <label class="tw:flex tw:flex-col tw:gap-1">
    <span>{{ label }}</span>
    <select
      v-model="modelValue"
      :required="required"
    >
      <option
        v-if="!required"
        :value="null"
      >
        -
      </option>
      <option
        v-for="platform in platforms"
        :key="platform.id"
        :value="platform.id"
      >
        {{ platform.name }}
      </option>
    </select>
  </label>
</template>
