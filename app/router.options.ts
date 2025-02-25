import type { RouterConfig } from "@nuxt/schema";

type RoutePath = `/${string}`;
const excludedPaths: RoutePath[] = [];

export default {
  routes: _routes => {
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction) {
      return _routes.filter(
        route => !excludedPaths.includes(route.path as RoutePath)
      );
    }

    return _routes;
  },
} satisfies RouterConfig;
