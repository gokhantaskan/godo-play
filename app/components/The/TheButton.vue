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

const {
  as = "button",
  variant = "primary",
  size = "md",
  disabled,
  leftIcon = "",
  rightIcon = "",
  type = "button",
} = defineProps<TheButtonProps>();

const buttonClasses = computed(() => [
  "button",
  `button--${variant}`,
  `button--${size}`,
  {
    "button--disabled": disabled,
  },
]);
</script>

<template>
  <Component
    :is="as"
    :class="buttonClasses"
    :disabled="disabled"
    :type="type"
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
