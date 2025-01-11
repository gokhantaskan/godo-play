import Hotjar from "@hotjar/browser";

const hotjarVersion = 6;

export default defineNuxtPlugin(nuxt => {
  const {
    public: {
      hotjar: { siteId },
    },
  } = useRuntimeConfig();

  nuxt.hooks.hook("page:finish", () => {
    Hotjar.init(Number(siteId), hotjarVersion);
  });
});
