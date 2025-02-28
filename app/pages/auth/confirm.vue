<script setup lang="ts">
const user = useSupabaseUser();
const redirectPath = useCookie(`sb-redirect-path`).value;

watch(
  user,
  () => {
    if (user.value) {
      // Clear cookie
      useCookie(`sb-redirect-path`).value = null;
      // Redirect to path
      return navigateTo(redirectPath || "/");
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="tw:container">Waiting for login...</div>
</template>
