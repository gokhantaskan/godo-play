<script setup lang="ts">
import type { SelectOption } from "@/components/The/TheSelect.vue";
import {
  SUPPORTED_PLATFORM_IDS,
  SUPPORTED_PLATFORMS,
} from "~~/shared/constants";
import type { PlatformHardcoded } from "~~/shared/types/globals";

type SupportedPlatform = PlatformHardcoded;

interface PlatformSelectProps {
  allowEmpty?: boolean;
  excludePlatforms?: SupportedPlatform["id"][];
  includePlatforms?: SupportedPlatform["id"][];
  multiple?: boolean;
}

const props = withDefaults(defineProps<PlatformSelectProps>(), {
  allowEmpty: false,
  multiple: false,
  excludePlatforms: () => [],
  includePlatforms: () => [...SUPPORTED_PLATFORM_IDS],
});

const modelValue = defineModel<
  SupportedPlatform["id"][] | SupportedPlatform["id"]
>();

const allOptions = computed<SelectOption[]>(() => {
  return [
    ...SUPPORTED_PLATFORMS.map(platform => ({
      label: platform.name,
      value: platform.id,
      icon: platform.icon,
    })),
    ...(props.allowEmpty
      ? [{ value: null, label: "Any Platform", icon: "lucide:gamepad-2" }]
      : []),
  ];
});

const availableOptions = computed(() =>
  allOptions.value
    .filter(option => {
      // Always allow "Any Platform" option if allowEmpty is true
      if (option.value === null) {
        return props.allowEmpty;
      }

      // For platform options, check include/exclude lists
      return (
        props.includePlatforms.includes(
          option.value as SupportedPlatform["id"]
        ) &&
        !props.excludePlatforms.includes(
          option.value as SupportedPlatform["id"]
        )
      );
    })
    .sort((a, b) => a.label.localeCompare(b.label))
);
</script>

<template>
  <TheSelect
    v-model="modelValue"
    label="Platform"
    :options="availableOptions"
    :multiple="multiple"
  />
</template>
