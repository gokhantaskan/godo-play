<script setup lang="ts">
import { Icon } from "#components";

interface Props {
  value: boolean;
  ariaLabelFalse?: string;
  ariaLabelTrue?: string;
  ariaHidden?: boolean;
}

defineOptions({
  inheritAttrs: false,
});

withDefaults(defineProps<Props>(), {
  ariaLabelFalse: "No",
  ariaLabelTrue: "Yes",
});
</script>

<template>
  <Icon
    :name="value ? 'i-lucide-check' : 'i-lucide-x'"
    :class="value ? 'tw:text-green' : 'tw:text-red'"
    :aria-label="
      !ariaHidden ? (value ? ariaLabelTrue : ariaLabelFalse) : undefined
    "
    :aria-hidden="ariaHidden"
  />
</template>
