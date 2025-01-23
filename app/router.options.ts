import type { RouterConfig } from "@nuxt/schema";

const excludedPaths = ["/admin"];

export default {
  routes: _routes => {
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction) {
      return _routes.filter(route => !excludedPaths.includes(route.path));
    }

    return _routes;
  },
} satisfies RouterConfig;
