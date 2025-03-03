import { defineEventHandler } from "h3";

import { authHandler } from "../../utils/authHandler";

/**
 * Protected API route that returns the current user's information
 * Uses the authHandler to verify authentication if not already done by middleware
 */
export default defineEventHandler(async event => {
  // Get user from context (set by middleware) or authenticate directly
  const user = event.context.user ?? (await authHandler(event));

  // Return user information
  return {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
    created_at: user.created_at,
  };
});
