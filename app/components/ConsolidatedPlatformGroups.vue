<script setup lang="ts">
import { getConsolidatedPlatformGroups } from "#imports";

export type ConsolidatedPlatformGroupsProps = {
  platformGroups: GameWithRelations["platformGroups"];
};

defineProps<ConsolidatedPlatformGroupsProps>();
</script>

<template>
  <slot :platform-groups="getConsolidatedPlatformGroups(platformGroups)" />
</template>
