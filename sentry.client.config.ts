import * as Sentry from "@sentry/nuxt";

Sentry.init({
  dsn: process.env.NUXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.5,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  trackComponents: true,
  hooks: ["activate", "create", "destroy", "mount", "update", "unmount"],
  integrations: [Sentry.replayIntegration()],
  debug: process.env.NODE_ENV === "development",
});
