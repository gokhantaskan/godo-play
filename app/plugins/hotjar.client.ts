import Hotjar from "@hotjar/browser";

const hotjarVersion = 6;

export default defineNuxtPlugin(nuxt => {
  const isProduction = import.meta.env.PROD;
  const {
    public: {
      hotjar: { siteId },
    },
  } = useRuntimeConfig();

  if (isProduction) {
    nuxt.hooks.hook("page:finish", () => {
      Hotjar.init(Number(siteId), hotjarVersion);
    });
  }
});
