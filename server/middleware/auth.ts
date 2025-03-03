import { defineEventHandler } from "h3";

import { authHandler } from "../utils/authHandler";

/**
 * Authentication middleware for protected routes
 * Checks if the user is authenticated using Supabase
 * Returns 401 error if not authenticated
 *
 * Allows public access to GET requests for certain resources
 * Requires authentication for other HTTP methods
 */
export default defineEventHandler(async event => {
  // Skip auth check for non-API routes
  const path = event.path || "";
  if (!path.startsWith("/api/")) {
    return;
  }

  // Define resources that allow public GET requests
  const publicGetResources = ["games", "game-modes", "stores"];

  // Define paths that are always public (regardless of HTTP method)
  const alwaysPublicPaths = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/callback",
  ];

  // Check if the current path is for a public GET resource
  const isPublicGetResource = publicGetResources.some(resource =>
    path.startsWith(`/api/${resource}`)
  );

  // Allow public access to GET requests for public resources
  if (isPublicGetResource && event.method === "GET") {
    return;
  }

  // Skip auth check for always public paths
  if (alwaysPublicPaths.some(p => path.startsWith(p))) {
    return;
  }

  // Use the authHandler to get the authenticated user
  // This will throw an error if the user is not authenticated
  const user = await authHandler(event);

  // Set the user in the event context for use in route handlers
  event.context.user = user;
});
