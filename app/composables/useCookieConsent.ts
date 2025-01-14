import { agreedToCookiesScriptConsent } from "@/utils/cookie";
import { useCookie, useState } from "#imports";

import { useScripts } from "./useScripts";

const COOKIE_CONSENT_KEY = "cookie-consent";

const COOKIE_EXPIRY = {
  ACCEPTED: 60 * 60 * 24 * 365, // 1 year
  REJECTED: 60 * 60 * 24 * 2, // 2 days
} as const;

export function useCookieConsent() {
  const cookie = useCookie<boolean | null>(COOKIE_CONSENT_KEY);

  const isLoading = useState("cookieConsentLoading", () => false);
  const cookieConsent = useState<boolean | null>("cookieConsent", () =>
    cookie.value === true ? true : cookie.value === false ? false : null
  );

  const { updateGtagConsent } = useScripts();

  function setCookieConsent(value: boolean) {
    cookie.value = value;
    cookieConsent.value = value;

    if (value) {
      agreedToCookiesScriptConsent.accept();
      updateGtagConsent(true);
    } else {
      updateGtagConsent(false);
    }
  }

  function acceptCookies() {
    const cookieOptions = {
      maxAge: COOKIE_EXPIRY.ACCEPTED,
      sameSite: "lax" as const,
      secure: true,
    };

    cookie.value = true;
    Object.assign(cookie, cookieOptions);
    setCookieConsent(true);
  }

  function rejectCookies() {
    const cookieOptions = {
      maxAge: COOKIE_EXPIRY.REJECTED,
      sameSite: "lax" as const,
      secure: true,
    };

    cookie.value = false;
    Object.assign(cookie, cookieOptions);
    setCookieConsent(false);
  }

  // Initialize consent state if cookie exists
  if (import.meta.client && cookie.value === true) {
    setCookieConsent(true);
  }

  return {
    cookieConsent,
    isLoading,
    acceptCookies,
    rejectCookies,
  };
}
