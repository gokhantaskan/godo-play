// import { agreedToCookiesScriptConsent } from "@/utils/cookie";
import { useClarityScript, useGtag } from "#imports";

export function useScripts() {
  const { gtag } = useGtag();

  function initScripts() {
    const { onLoaded: onClarityLoaded } = useClarityScript();

    onClarityLoaded(({ clarity }) => {
      console.info("💎");
      clarity("consent");
    });

    if (IS_DEV) {
      return;
    }

    // Initialize Inspectlet
    // const { onLoaded: onInspectletLoaded } = useScript(
    //   {
    //     key: "insp",
    //     src: "/scripts/insp.js",
    //   },
    //   {
    //     trigger: agreedToCookiesScriptConsent,
    //   }
    // );

    // onInspectletLoaded(() => {
    //   console.info("insp loaded");
    // });
  }

  function updateGtagConsent(granted: boolean) {
    gtag("consent", "update", {
      ad_user_data: granted ? "granted" : "denied",
      ad_personalization: granted ? "granted" : "denied",
      ad_storage: granted ? "granted" : "denied",
      analytics_storage: granted ? "granted" : "denied",
    });
  }

  return {
    initScripts,
    updateGtagConsent,
  };
}
