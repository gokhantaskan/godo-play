<script setup lang="ts">
import {
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  type TooltipProviderProps,
  TooltipRoot,
  type TooltipRootEmits,
  type TooltipRootProps,
  TooltipTrigger,
  useForwardPropsEmits,
} from "radix-vue";

type TooltipProps = TooltipRootProps & {
  content?: string;
  providerProps?: TooltipProviderProps;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  alignOffset?: number;
  arrowWidth?: number;
  arrowHeight?: number;
  delayDuration?: number;
};

const props = withDefaults(defineProps<TooltipProps>(), {
  content: "",
  providerProps: () => ({}),
  side: "bottom",
  align: "center",
  alignOffset: 4,
  arrowWidth: 11,
  arrowHeight: 5,
  delayDuration: 50,
});

const emits = defineEmits<TooltipRootEmits>();

const forward = useForwardPropsEmits(props, emits);
</script>

<template>
  <TooltipProvider v-bind="providerProps">
    <TooltipRoot v-bind="forward">
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>
      <TooltipContent
        :side="side"
        :align="align"
        class="tooltip"
      >
        {{ content }}
        <TooltipArrow
          :width="arrowWidth"
          :height="arrowHeight"
          class="tooltip__arrow"
        />
      </TooltipContent>
    </TooltipRoot>
  </TooltipProvider>
</template>

<style lang="scss">
.tooltip {
  z-index: 50;
  max-width: 350px;
  padding-block: 0.25rem;
  padding-inline: 0.5rem;
  color: var(--tw-color-bg);
  font-size: 0.875rem;
  line-height: 1.25;
  background-color: var(--tw-color-fg);
  border-radius: var(--tw-radius-sm);
  animation: tooltip-slide 0.2s ease-in-out;

  &__arrow {
    fill: var(--tw-color-fg);
  }
}

@keyframes tooltip-slide {
  from {
    opacity: 0;
    transform: translateY(0.25rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
