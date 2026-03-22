<script setup lang="ts">
import { computed } from "vue";
import type { RouteLocationRaw } from "vue-router";

const supabase = useSupabaseClient();

interface LogoutWrapperProps {
  redirect?: boolean;
  redirectTo?: RouteLocationRaw;
}

const { redirect = true, redirectTo = { name: "LoginPage" } } =
  defineProps<LogoutWrapperProps>();

const shouldRedirect = computed(() => redirect ?? !!redirectTo);

async function handleLogout() {
  await supabase.auth.signOut();
  if (shouldRedirect.value) {
    navigateTo(redirectTo);
  }
}

if (!useSlots().default) {
  throw new Error("LogoutWrapper must be used with a default slot");
}
</script>

<template>
  <slot :logout-fn="handleLogout" />
</template>
