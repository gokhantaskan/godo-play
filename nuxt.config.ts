import { defineOrganization } from "nuxt-schema-org/schema";
import svgLoader from "vite-svg-loader";

import { repositoryName } from "./slicemachine.config.json";

const disallowedPaths = [
  "/_ipx/",
  "/api/",
  "/admin/",
  "/preview",
  "/slice-simulator",
];

const FRONTEND_URL = process.env.NUXT_PUBLIC_FRONTEND_URL;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  nitro: {
    experimental: {
      tasks: true,
      asyncContext: true,
    },
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
    redis: {
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
    google: {
      recaptcha: {
        secretKey: process.env.GOOGLE_RECAPTCHA_SECRET_KEY,
      },
    },
    public: {
      hotjar: {
        siteId: "",
      },
      google: {
        recaptcha: {
          siteKey: "",
        },
      },
      gtag: {
        id: "",
      },
      frontendUrl: FRONTEND_URL,
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
          // Keep viewbox to allow responsive svgs
          plugins: ["preset-default", "removeDimensions"],
        },
      }),
    ],
  },
  build: {
    transpile: ["drizzle-orm"],
  },
  typescript: {
    typeCheck: true,
  },
  routeRules: {
    "/games/cross-play": {
      redirect: { to: "/games", statusCode: 301 },
    },
  },
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/image",
    "@nuxt/icon",
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
    "nuxt-gtag",
    "@nuxt/scripts",
    "@nuxtjs/prismic",
    "@primevue/nuxt-module",
    "nuxt-schema-org",
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
      {
        prefix: "stores",
        dir: "./app/assets/icons/stores",
      },
    ],
  },
  site: {
    url: FRONTEND_URL,
    name: "GōdōPlay",
  },
  sitemap: {
    exclude: disallowedPaths,
    sitemapsPathPrefix: "/",
    sitemaps: {
      ["sitemap_pages"]: {
        includeAppSources: true,
        exclude: ["/games/**"],
      },
      ["sitemap_games"]: {
        includeAppSources: true,
        include: ["/games/**"],
        sources: [`/api/__sitemap__/urls/games`],
      },
    },
  },
  robots: {
    disallow: disallowedPaths,
  },
  gtag: {
    id: process.env.NUXT_PUBLIC_GTAG_ID,
    initCommands: [
      // Setup up consent mode
      [
        "consent",
        "default",
        {
          ad_user_data: "denied",
          ad_personalization: "denied",
          ad_storage: "denied",
          analytics_storage: "denied",
          wait_for_update: 500,
        },
      ],
    ],
  },
  prismic: {
    endpoint: repositoryName,
  },
  primevue: {
    usePrimeVue: true,
    autoImport: false,
    loadStyles: false,
    components: {
      prefix: "P",
      include: ["AutoComplete", "Toast"],
    },
    options: {
      theme: "none",
    },
  },
  schemaOrg: {
    identity: defineOrganization({
      name: "GodoPlay",
      url: "https://godo-play.com",
      logo: "/favicon.svg",
      description:
        "GodoPlay is a platform for discovering cross-platform and cross-play games across different platforms including PC, Mac, PlayStation, Xbox, and Nintendo Switch.",
      // sameAs: ["https://twitter.com/gamecrossplay"],
      email: "contact@godo-play.com",
      contactPoint: {
        "@type": "ContactPoint",
        email: "contact@godo-play.com",
      },
    }),
  },
});
