<script setup lang="ts">
type SignInType = ReturnType<
  typeof useSupabaseClient
>["auth"]["signInWithPassword"];

type AuthError = Awaited<ReturnType<SignInType>>["error"];

definePageMeta({
  name: "LoginPage",
});

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
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) {
      authError.value = error;
      return;
    }
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
