<script setup lang="ts">
import {
  PopoverArrow,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from "radix-vue";

interface Props {
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

const props = withDefaults(defineProps<Props>(), {
  side: "top",
  sideOffset: 5,
});
</script>

<template>
  <PopoverRoot>
    <PopoverTrigger>
      <Icon name="lucide:info" />
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        :side="props.side"
        :side-offset="props.sideOffset"
        class="info-bubble tw:animate-in tw:fade-in-0 tw:zoom-in-95 data-[state=closed]:tw:animate-out data-[state=closed]:tw:fade-out-0 data-[state=closed]:tw:zoom-out-95"
      >
        <div>
          {{ props.content }}
        </div>

        <PopoverArrow class="tw:fill-white" />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style scoped lang="scss">
.info-bubble {
  z-index: 50;
  display: inline-block;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: var(--tw-radius-md);
  box-shadow: var(--tw-shadow-md);
  background-color: white;
}
</style>
