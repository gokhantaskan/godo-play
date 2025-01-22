export interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export async function verifyRecaptchaToken(token: string) {
  const config = useRuntimeConfig();
  const recaptchaSecret = config.google.recaptcha.secretKey;

  if (!recaptchaSecret) {
    throw createError({
      statusCode: 500,
      message: "reCAPTCHA secret key is not configured",
    });
  }

  const response = await $fetch<RecaptchaResponse>(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      body: new URLSearchParams({
        secret: recaptchaSecret,
        response: token,
      }),
    }
  );

  return {
    success: response.success,
    errors: response["error-codes"],
  };
}
