import { defineOrganization } from "nuxt-schema-org/schema";
import svgLoader from "vite-svg-loader";

import { repositoryName } from "./slicemachine.config.json";

const disallowedPaths = [
  "/_ipx/",
  "/auth/",
  "/admin/",
  "/preview",
  "/slice-simulator",
];

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
  scripts: {
    registry: {
      clarity: {
        id: "",
        // scriptOptions: {
        //   trigger: "manual",
        // },
      },
    },
  },
  $development: {
    scripts: {
      registry: {
        clarity: "mock",
      },
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
    supabase: {
      url: process.env.SUPABASE_URL,
      secret: process.env.SUPABASE_SECRET,
    },
    public: {
      scripts: {
        clarity: {
          id: "",
        },
      },
      google: {
        recaptcha: {
          siteKey: "",
        },
      },
      gtag: {
        id: "",
      },
      supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_KEY,
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
  app: {
    head: {
      link: [
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/favicon.svg",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..700;1,300..700&family=Lexend:wght@300..700&display=swap",
        },
      ],
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
      }) as any,
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
    "@nuxt/eslint", // "@nuxt/fonts",
    "@nuxt/image",
    "@nuxt/icon",
    "@nuxtjs/sitemap",
    "@nuxtjs/supabase",
    "@nuxtjs/robots",
    "nuxt-gtag",
    "@nuxt/scripts",
    "@nuxtjs/prismic",
    "nuxt-schema-org",
    "nuxt-security",
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
  // fonts: {
  //   families: [
  //     { name: "Figtree", provider: "google", global: true },
  //     { name: "Lexend", provider: "google", global: true },
  //     { name: "Roboto Mono", provider: "google" },
  //   ],
  //   experimental: {
  //     processCSSVariables: true,
  //   },
  // },
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
    name: "GodoPlay",
  },
  sitemap: {
    exclude: disallowedPaths,
    // sitemapsPathPrefix: "/",
    sitemaps: {
      pages: {
        includeAppSources: true,
        // exclude: ["/games/**"],
      },
      games: {
        includeAppSources: false,
        sources: ["/api/__sitemap__/urls/games"],
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
  supabase: {
    redirectOptions: {
      login: "/auth/login",
      callback: "/auth/confirm",
      include: ["/admin(/*)?"],
      cookieRedirect: true,
    },
  },
  security: {
    corsHandler: {
      origin: "https://godo-play.com",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    },
    headers: {
      contentSecurityPolicy: {
        "img-src": [
          "'self'",
          "data:",
          "https://images.igdb.com",
          "https://images.prismic.io",
          "https://c.clarity.ms",
          "https://c.bing.com",
        ],
        "frame-src": [
          "'self'",
          "https://godoplay.prismic.io",
          "https://www.youtube.com",
          "https://www.youtube-nocookie.com",
          "https://docs.google.com",
          "https://www.google.com",
          "https://www.recaptcha.net",
        ],
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "'strict-dynamic'",
          "'nonce-{{nonce}}'",
          "https://*.netlify.app",
          "https://*.netlify.com",
        ],
        "connect-src": [
          "'self'",
          "https://www.youtube.com",
          "https://www.youtube-nocookie.com",
          "https://*.googleapis.com",
          "https://*.gstatic.com",
          "https://www.google-analytics.com",
          "https://www.google.com",
          "https://*.clarity.ms",
          "https://api.iconify.design",
          "https://*.supabase.co",
          "https://*.prismic.io",
        ],
      },
      crossOriginEmbedderPolicy: "unsafe-none",
      referrerPolicy: "strict-origin-when-cross-origin",
      permissionsPolicy: {
        fullscreen: [
          "self",
          '"https://www.youtube.com"',
          '"https://www.youtube-nocookie.com"',
        ],
        autoplay: [
          "self",
          '"https://www.youtube.com"',
          '"https://www.youtube-nocookie.com"',
        ],
        "encrypted-media": [
          "self",
          '"https://www.youtube.com"',
          '"https://www.youtube-nocookie.com"',
        ],
      },
    },
  },
});
