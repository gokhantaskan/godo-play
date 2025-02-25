import { createBrowserClient } from "@supabase/ssr";

export function useSupabaseClient() {
  const config = useRuntimeConfig();

  return createBrowserClient(
    config.public.supabase.url,
    config.public.supabase.key
  );
}
