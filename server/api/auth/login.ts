import type { H3Event } from "h3";

import { useSupabaseServer } from "~~/server/utils/supabase";

export default defineEventHandler(async (event: H3Event) => {
  const supabase = useSupabaseServer();

  const { email, password, recaptchaToken } = await readBody(event);

  const { success: recaptchaSuccess } =
    await verifyRecaptchaToken(recaptchaToken);

  if (!recaptchaSuccess) {
    throw createError({
      statusCode: 400,
      message: "Invalid recaptcha token",
    });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw createError({ statusCode: 500, message: error.message });
  }

  if (!data.session) {
    throw createError({
      statusCode: 401,
      message: "No session returned from authentication",
    });
  }

  return data.session;
});
