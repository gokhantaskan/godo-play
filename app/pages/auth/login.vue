<script setup lang="ts">
import type { AuthError } from "@supabase/supabase-js";

definePageMeta({
  name: "LoginPage",
});

const route = useRoute();
const supabase = useSupabaseClient();
const { getToken, error: recaptchaError } = useRecaptcha();

const email = ref("");
const password = ref("");
const authError = ref<AuthError | null>(null);

async function handleSubmit() {
  try {
    const recaptchaToken = await getToken("login");

    if (!recaptchaToken) {
      authError.value = {
        name: "RecaptchaError",
        message: recaptchaError.value || "reCAPTCHA verification failed",
      } as AuthError;
      return;
    }

    // Login with custom API
    const session = await $fetch("/api/auth/login", {
      method: "POST",
      body: {
        email: email.value,
        password: password.value,
        recaptchaToken,
      },
    });

    // Set the session in Supabase client
    const { error: setSessionError } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    if (setSessionError) {
      authError.value = setSessionError;
      return;
    }

    // Get the redirect URL from query parameters
    const redirect = route.query.redirect as string;
    navigateTo(decodeURIComponent(redirect || "/"));
  } catch (err) {
    authError.value = {
      name: "AuthError",
      message:
        err instanceof Error ? err.message : "An error occurred during login",
    } as AuthError;
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
