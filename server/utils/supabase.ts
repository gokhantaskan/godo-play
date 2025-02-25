import { createServerClient } from "@supabase/ssr";
import { parseCookies, splitCookiesString } from "h3";

export function useSupabaseServer() {
  const config = useRuntimeConfig();
  const event = useEvent();

  return createServerClient(
    config.public.supabase.url,
    config.public.supabase.key,
    {
      cookies: {
        getAll() {
          const parsedCookies = parseCookies(event);

          return Object.entries(parsedCookies).map(([name, value]) => ({
            name,
            value,
          }));
        },
        setAll(cookieStrings) {
          const cookies = splitCookiesString(
            cookieStrings
              .map(({ name, value }) => `${name}=${value}`)
              .join("; ")
          );

          cookies.forEach(cookie => {
            event.node.res.setHeader("Set-Cookie", cookie);
          });
        },
      },
    }
  );
}
