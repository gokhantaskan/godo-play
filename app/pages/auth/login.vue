<script setup lang="ts">
import type { AuthError } from "@supabase/supabase-js";

definePageMeta({
  name: "LoginPage",
});

const supabase = useSupabaseClient();
const route = useRoute();

const email = ref("");
const password = ref("");
const authError = ref<AuthError | null>(null);

async function handleSubmit() {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (error) {
    authError.value = error;
  } else {
    // Get the redirect URL from query parameters
    const redirect = route.query.redirect as string;
    navigateTo(decodeURIComponent(redirect || "/"));
  }
}
</script>

<template>
  <div class="tw:container tw:max-w-[640px]">
    <form @submit.prevent="handleSubmit">
      <div class="tw:flex tw:flex-col tw:gap-2">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
        />
      </div>
      <div class="tw:flex tw:flex-col tw:gap-2">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
        />
      </div>
      <TheButton type="submit">Login</TheButton>
    </form>
  </div>
</template>
