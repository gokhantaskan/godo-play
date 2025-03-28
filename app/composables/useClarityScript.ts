import { agreedToCookiesScriptConsent } from "@/utils/cookie";

export function useClarityScript() {
  const config = useRuntimeConfig();
  const id = config.public.scripts.clarity.id;

  return useScriptClarity({
    id,
    scriptOptions: {
      trigger: agreedToCookiesScriptConsent,
    },
  });
}
