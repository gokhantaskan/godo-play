import { useScriptTriggerConsent } from "#imports";

export const useScriptConsent = () => {
  const cookieConsent = ref(false);

  // Create a consent trigger for scripts
  useScriptTriggerConsent({
    consent: cookieConsent,
  });

  return {
    cookieConsent,
  };
};
