declare module "nuxt/app" {
  interface PageMeta {
    auth?: {
      required: boolean;
      role?: "admin" | "user";
    };
  }
}

export {};
