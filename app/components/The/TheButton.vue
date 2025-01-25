<script setup lang="ts">
export interface TheButtonProps {
  as?: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  leftIcon?: string;
  rightIcon?: string;
  [key: string]: any;
}

const props = withDefaults(defineProps<TheButtonProps>(), {
  as: "button",
  variant: "primary",
  size: "md",
  disabled: undefined,
  type: "button",
  leftIcon: "",
  rightIcon: "",
});

const buttonClasses = computed(() => [
  "button",
  `button--${props.variant}`,
  `button--${props.size}`,
  {
    "button--disabled": props.disabled,
  },
]);
</script>

<template>
  <Component
    :is="as"
    :class="buttonClasses"
    :disabled="disabled"
  >
    <span
      v-if="$slots.prefix || leftIcon"
      class="button__prefix"
    >
      <slot name="prefix">
        <Icon
          v-if="leftIcon"
          :name="leftIcon"
        />
      </slot>
    </span>
    <slot />
    <span
      v-if="$slots.suffix || rightIcon"
      class="button__suffix"
    >
      <slot name="suffix">
        <Icon
          v-if="rightIcon"
          :name="rightIcon"
        />
      </slot>
    </span>
  </Component>
</template>
