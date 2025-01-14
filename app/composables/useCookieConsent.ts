import { agreedToCookiesScriptConsent } from "@/utils/cookie";
import { useState } from "#imports";

import { useScripts } from "./useScripts";

const COOKIE_CONSENT_KEY = "cookie-consent";

export function useCookieConsent() {
  const cookieConsent = useState<boolean | null>("cookieConsent", () => null);
  const isLoading = useState("cookieConsentLoading", () => true);

  const { updateGtagConsent } = useScripts();

  const consentCookie = useCookie<boolean>(COOKIE_CONSENT_KEY, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
    secure: true,
  });

  function acceptCookies() {
    cookieConsent.value = true;
    consentCookie.value = true;
    agreedToCookiesScriptConsent.accept();
    updateGtagConsent(true);
  }

  function rejectCookies() {
    cookieConsent.value = false;
    consentCookie.value = false;
    updateGtagConsent(false);
  }

  function initCookieConsent() {
    cookieConsent.value = consentCookie.value ?? null;

    if (cookieConsent.value === true) {
      agreedToCookiesScriptConsent.accept();
      updateGtagConsent(true);
    }

    // Mark as loaded after initialization
    isLoading.value = false;
  }

  return {
    cookieConsent,
    isLoading,
    acceptCookies,
    rejectCookies,
    initCookieConsent,
  };
}
