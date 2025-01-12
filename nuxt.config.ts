import svgLoader from "vite-svg-loader";

const isProduction = process.env.NODE_ENV === "production";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  runtimeConfig: {
    upstash: {
      redis: {
        rest: {
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        },
      },
    },
    igdb: {
      endpoint: process.env.IGDB_ENDPOINT,
    },
    tw: {
      clientId: process.env.TW_CLIENT_ID,
      clientSecret: process.env.TW_CLIENT_SECRET,
      grantType: process.env.TW_GRANT_TYPE,
      oauthEndpoint: process.env.TW_OAUTH_ENDPOINT,
    },
    public: {
      hotjar: {
        siteId: process.env.NUXT_HOTJAR_ID,
      },
    },
  },
  nitro: {
    plugins: ["plugins/auth.ts"],
    storage: {
      redis: {
        driver: "redis",
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        db: Number(process.env.REDIS_DB),
      },
    },
  },
  devServer: {
    host: "0.0.0.0",
    port: 3000,
    https: {
      cert: "./localhost+2.pem",
      key: "./localhost+2-key.pem",
    },
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
  typescript: {
    typeCheck: true,
  },
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/image",
    "@nuxt/icon",
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
    "nuxt-gtag",
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
  app: {
    head: {
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
      script: [
        ...(isProduction
          ? [
              {
                type: "text/javascript",
                "data-cmp-ab": "1",
                src: "https://cdn.consentmanager.net/delivery/autoblocking/a2c96b2072522.js",
                "data-cmp-host": "b.delivery.consentmanager.net",
                "data-cmp-cdn": "cdn.consentmanager.net",
                "data-cmp-codesrc": "16",
              },
            ]
          : []),
      ],
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
  gtag: {
    enabled: isProduction,
    id: process.env.NUXT_PUBLIC_GTAG_ID,
  },
});
