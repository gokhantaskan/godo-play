export default defineNuxtPlugin(async () => {
  const supabase = useSupabaseClient();
  const route = useRoute();

  // Set up auth state change listener
  supabase.auth.onAuthStateChange((event, _session) => {
    const authMeta = route.meta.auth;

    if (event === "SIGNED_OUT" && authMeta?.required) {
      // If current page requires auth, redirect to login with the current path
      navigateTo({
        name: "LoginPage",
        query: { redirect: encodeURIComponent(route.fullPath) },
      });
    } else if (event === "SIGNED_IN" && route.name === "LoginPage") {
      // On sign in, redirect to the saved redirect path or home
      const redirect = route.query.redirect as string;
      navigateTo(decodeURIComponent(redirect || "/"));
    }
  });
});
