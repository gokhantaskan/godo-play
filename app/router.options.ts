import type { RouterConfig } from "@nuxt/schema";

export default {
  routes: _routes => {
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction) {
      return _routes.filter(route => route.path !== "/submit-game");
    }

    return _routes;
  },
} satisfies RouterConfig;
