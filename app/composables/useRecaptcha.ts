declare global {
  interface Window {
    grecaptcha?: Record<string, any>;
  }
}

export function useRecaptcha() {
  const { siteKey } = useRuntimeConfig().public.google.recaptcha;
  const error = ref<string | null>(null);

  useHead({
    script: [
      {
        src: `https://www.google.com/recaptcha/api.js?render=${siteKey}`,
      },
    ],
  });

  async function getToken(action: string): Promise<string | null> {
    try {
      return await window.grecaptcha?.execute(siteKey, { action });
    } catch (err) {
      console.error(err);
      error.value = "Failed to verify reCAPTCHA";
      return null;
    }
  }

  return {
    error,
    getToken,
  };
}
