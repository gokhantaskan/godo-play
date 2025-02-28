import "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    auth?: {
      required: boolean;
      role?: "admin" | "user";
    };
  }
}
