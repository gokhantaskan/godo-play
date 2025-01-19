<script setup lang="ts">
interface Props {
  label?: string;
  variant?: "primary" | "green" | "yellow" | "red" | "gray";
  size?: "sm" | "md";
  removable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  label: "",
  variant: "primary",
  size: "sm",
  removable: false,
});

defineEmits<{
  remove: [];
}>();

const chipClasses = computed(() => [
  "chip",
  `chip--${props.variant}`,
  `chip--${props.size}`,
]);
</script>

<template>
  <div :class="chipClasses">
    <slot>
      <span>{{ label }}</span>
    </slot>
    <button
      v-if="removable"
      type="button"
      class="chip__remove"
      :aria-label="`Remove ${label}`"
      @click="$emit('remove')"
    >
      <slot name="remove-icon">
        <Icon name="lucide:x" />
      </slot>
    </button>
  </div>
</template>
