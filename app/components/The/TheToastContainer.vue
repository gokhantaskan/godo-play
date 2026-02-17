<script setup lang="ts">
import type { ToastType } from "~/composables/useToast";

const { toasts, dismiss } = useToast();

const iconMap: Record<ToastType, string> = {
  success: "heroicons:check-circle",
  error: "heroicons:x-circle",
  warning: "heroicons:exclamation-triangle",
};
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup
        name="toast"
        tag="div"
        class="toast-container__list"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast--${toast.type}`]"
          role="alert"
          @click="dismiss(toast.id)"
        >
          <Icon
            :name="iconMap[toast.type]"
            class="toast__icon"
          />
          <span class="toast__message">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.toast-container {
  position: fixed;
  inset-block-end: 1rem;
  inset-inline-end: 1rem;
  z-index: 9999;
  pointer-events: none;
}

.toast-container__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.toast {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding-block: 0.75rem;
  padding-inline: 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: white;
  cursor: pointer;
  pointer-events: auto;
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 10%),
    0 4px 6px -4px rgb(0 0 0 / 10%);
  max-inline-size: 24rem;
}

.toast--success {
  background-color: var(--tw-color-green-600, #16a34a);
}

.toast--error {
  background-color: var(--tw-color-red-600, #dc2626);
}

.toast--warning {
  background-color: var(--tw-color-amber-600, #d97706);
}

.toast__icon {
  flex-shrink: 0;
  inline-size: 1.25rem;
  block-size: 1.25rem;
}

.toast__message {
  flex: 1;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(1rem);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}
</style>
