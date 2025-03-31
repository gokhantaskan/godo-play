import { agreedToCookiesScriptConsent } from "@/utils/cookie";
import { useCookie, useState } from "#imports";

import { useScripts } from "./useScripts";

const COOKIE_CONSENT_KEY = "cookie-consent";

const COOKIE_EXPIRY = {
  ACCEPTED: 60 * 60 * 24 * 365, // 1 year
  REJECTED: 60 * 60 * 24 * 7, // 7 days
} as const;

const BASE_COOKIE_OPTIONS = {
  sameSite: "strict",
  secure: true,
  path: "/",
  httpOnly: false,
} as const;

export function useCookieConsent() {
  const cookie = useCookie<boolean | null>(COOKIE_CONSENT_KEY, {
    default: () => null,
    watch: true,
    maxAge: COOKIE_EXPIRY.REJECTED,
    ...BASE_COOKIE_OPTIONS,
  });
  const isLoading = useState("cookieConsentLoading", () => false);
  const cookieConsent = useState<boolean | null>(
    "cookieConsent",
    () => cookie.value
  );
  const { updateGtagConsent } = useScripts();
  const {
    proxy: { clarity },
  } = useClarityScript();

  function setCookieConsent(value: boolean) {
    isLoading.value = true;

    try {
      // Set cookie with appropriate expiry
      cookie.value = value;
      const maxAge = value ? COOKIE_EXPIRY.ACCEPTED : COOKIE_EXPIRY.REJECTED;

      // Update cookie options
      const cookieRef = useCookie<boolean | null>(COOKIE_CONSENT_KEY, {
        maxAge,
        ...BASE_COOKIE_OPTIONS,
      });

      cookieRef.value = value;
      cookieConsent.value = value;

      if (value) {
        agreedToCookiesScriptConsent.accept();
        updateGtagConsent(true);
        clarity("consent");
      } else {
        updateGtagConsent(false);
      }
    } finally {
      isLoading.value = false;
    }
  }

  function acceptCookies() {
    setCookieConsent(true);
  }

  function rejectCookies() {
    setCookieConsent(false);
  }

  function initializeCookieConsent() {
    if (import.meta.client && cookie.value === true) {
      setCookieConsent(true);
    }
  }

  // Initialize on composable creation
  initializeCookieConsent();

  return {
    cookieConsent,
    isLoading,
    acceptCookies,
    rejectCookies,
  };
}
