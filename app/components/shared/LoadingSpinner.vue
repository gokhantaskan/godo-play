<template>
  <div
    class="loading-spinner"
    role="status"
  >
    <div class="spinner"></div>
    <span class="tw:sr-only">Loading...</span>
  </div>
</template>

<style scoped>
.loading-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--tw-color-border);
  border-top-color: var(--tw-color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
