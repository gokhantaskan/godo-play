<script setup lang="ts">
interface Props {
  variant?: "gray" | "warning" | "success" | "error";
  title?: string;
  message?: string;
  icon?: string;
  size?: "sm" | "lg";
}

const props = withDefaults(defineProps<Props>(), {
  variant: "gray",
  title: "",
  message: "",
  icon: "",
  size: undefined,
});

const rootClasses = computed(() => {
  return ["alert", `alert--${props.variant}`, `alert--${props.size}`];
});
</script>

<template>
  <div :class="rootClasses">
    <div
      v-if="icon || $slots.icon"
      class="alert__icon"
    >
      <slot name="icon">
        <Icon
          v-if="icon"
          :name="icon"
        />
      </slot>
    </div>
    <div class="alert__content">
      <div
        v-if="title || $slots.title"
        class="alert__title"
      >
        <slot name="title">{{ title }}</slot>
      </div>
      <div
        v-if="message || $slots.default"
        class="alert__message"
      >
        <slot>{{ message }}</slot>
      </div>
    </div>
    <div class="alert__footer">
      <slot name="footer" />
    </div>
  </div>
</template>
