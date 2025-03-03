import type { User } from "@supabase/supabase-js";
import type { H3Event } from "h3";
import { createError } from "h3";

import { serverSupabaseSession, serverSupabaseUser } from "#supabase/server";

/**
 * Authentication handler for server routes
 * Checks if the user is authenticated using Supabase
 * Throws a 401 error if not authenticated
 * @returns The authenticated user
 */
export async function authHandler(event: H3Event): Promise<User> {
  // Get the session first to ensure cookies are processed
  const session = await serverSupabaseSession(event);

  if (!session) {
    throwAuthError();
  }

  // Get the user from Supabase session
  const user = await serverSupabaseUser(event);

  // If no user is found, throw an error
  if (!user) {
    throwAuthError();
  }

  return user!;
}

function throwAuthError() {
  throw createError({
    statusCode: 401,
    statusMessage: "Unauthorized",
  });
}
