import type { User } from "@supabase/supabase-js";

declare module "h3" {
  interface H3EventContext {
    /**
     * The authenticated Supabase user
     * Set by the auth middleware when a user is authenticated
     */
    user?: User;
  }
}
