import type { RouteMeta } from "vue-router";

export interface RouteMetaWithAuth extends RouteMeta {
  auth?: {
    required: boolean;
    role?: "admin" | "user";
  };
}
