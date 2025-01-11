<script setup lang="ts">
import { Icon } from "#components";

interface Props {
  value: boolean;
}

defineProps<Props>();
</script>

<template>
  <Icon
    :name="value ? 'i-lucide-check' : 'i-lucide-x'"
    :class="value ? 'tw:text-green' : 'tw:text-red'"
  />
</template>
