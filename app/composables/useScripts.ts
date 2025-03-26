import { agreedToCookiesScriptConsent } from "@/utils/cookie";
import { useGtag /* useScriptHotjar */ } from "#imports";

export function useScripts() {
  // const config = useRuntimeConfig();
  const { gtag } = useGtag();

  function initScripts() {
    if (IS_DEV) {
      return;
    }

    // Initialize Hotjar
    // const { onLoaded: onHotjarLoaded } = useScriptHotjar({
    //   id: Number(config.public.hotjar.siteId),
    //   sv: 6,
    //   scriptOptions: {
    //     trigger: agreedToCookiesScriptConsent,
    //   },
    // });

    // onHotjarLoaded(() => {
    //   console.info("hj loaded");
    // });

    // Initialize Inspectlet
    if (IS_PROD) {
      const { onLoaded: onInspectletLoaded } = useScript(
        {
          key: "insp",
          src: "/scripts/insp.js",
        },
        {
          trigger: agreedToCookiesScriptConsent,
        }
      );

      onInspectletLoaded(() => {
        console.info("insp loaded");
      });

      const { onLoaded: onClarityLoaded } = useScript(
        {
          key: "clarity",
          src: "/scripts/clarity.js",
        },
        {
          trigger: agreedToCookiesScriptConsent,
        }
      );

      onClarityLoaded(() => {
        console.info("clarity loaded");
      });
    }
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
