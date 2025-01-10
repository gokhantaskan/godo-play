import svgLoader from "vite-svg-loader";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  runtimeConfig: {
    igdb: {
      endpoint: process.env.IGDB_ENDPOINT,
    },
    tw: {
      clientId: process.env.TW_CLIENT_ID,
      clientSecret: process.env.TW_CLIENT_SECRET,
      grantType: process.env.TW_GRANT_TYPE,
      oauthEndpoint: process.env.TW_OAUTH_ENDPOINT,
    },
  },
  nitro: {
    plugins: ["plugins/auth.ts"],
  },
  vite: {
    plugins: [
      svgLoader({
        defaultImport: "component",
        svgoConfig: {
          // Keep viewbox to allow for responsive images
          plugins: ["preset-default", "removeDimensions"],
        },
      }),
    ],
  },
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/image",
    "@nuxt/icon",
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
  ],
  css: ["./app/assets/styles/tailwind.css", "./app/assets/styles/main.scss"],
  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
      "postcss-preset-env": {
        stage: 3,
        minimumVendorImplementations: 2,
        features: {
          "nesting-rules": { preserve: true },
          "custom-selectors": { preserve: false },
        },
      },
    },
  },
  devServer: {
    https: {
      cert: "./localhost+2.pem",
      key: "./localhost+2-key.pem",
    },
  },
  app: {
    head: {
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },
  fonts: {
    experimental: {
      processCSSVariables: true,
    },
  },
  icon: {
    mode: "svg",
    size: "inherit",
    customCollections: [
      {
        prefix: "local",
        dir: "./app/assets/icons",
      },
      {
        prefix: "platforms",
        dir: "./app/assets/icons/platforms",
      },
    ],
  },
  site: {
    url: "https://godo-play.com",
    name: "GōdōPlay",
  },
  robots: {
    disallow: ["/_ipx/", "/admin/"],
  },
});
