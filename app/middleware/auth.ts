import type { RouteLocationNormalizedGeneric } from "vue-router";

import type { RouteMetaWithAuth } from "@/types/page";

export default defineNuxtRouteMiddleware(async to => {
  const supabase = useSupabaseClient();

  // Get the route meta
  const authMeta = (to.meta as RouteMetaWithAuth).auth;

  // If route doesn't require auth, allow navigation
  if (!authMeta?.required) {
    return;
  }

  // Wait for the session to be available
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    console.error("Auth middleware error:", error);
    return redirectToLogin(to);
  }

  // If we have a session and trying to access login page
  if (session && to.name === "LoginPage") {
    // If there's a redirect parameter, use that
    const redirect = to.query.redirect as string;
    return navigateTo(decodeURIComponent(redirect || "/"));
  }

  // TODO: Add role-based access control here when needed
  // if (authMeta.role && session.user.role !== authMeta.role) {
  //   return navigateTo("/unauthorized");
  // }
});

function redirectToLogin(to: RouteLocationNormalizedGeneric) {
  return navigateTo({
    name: "LoginPage",
    query: { redirect: to.fullPath },
  });
}
