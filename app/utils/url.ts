import { WEBSITES } from "~~/shared/constants/websites";

/**
 * Finds matching website information from predefined `WEBSITES` constant based on URL
 */
export function getWebsiteInfo(websiteUrl: string) {
  const normalizedUrl = websiteUrl
    .toLowerCase()
    .replace(/^(?:https?:\/\/)?(?:www\.)?/i, ""); // Remove protocol and www

  // First try to match subdomains
  for (const site of Object.values(WEBSITES)) {
    if (site.subdomains && site.url[0]) {
      const mainDomain = site.url[0];
      if (typeof site.subdomains === "object") {
        for (const subdomain of Object.values(site.subdomains)) {
          if (
            normalizedUrl.startsWith(`${subdomain.subdomain}.${mainDomain}`)
          ) {
            return {
              url: site.url,
              icon: subdomain.icon,
              label: subdomain.label,
            };
          }
        }
      } else if (site.subdomains === true) {
        // If subdomains is true and URL matches any subdomain of the main domain
        if (normalizedUrl.includes(mainDomain)) {
          return {
            url: site.url,
            icon: site.icon,
            label: site.label,
          };
        }
      }
    }
  }

  // Then try to match main domains
  return Object.values(WEBSITES).find(site => {
    const urls = Array.isArray(site.url) ? site.url : [site.url];
    return urls.some(url => normalizedUrl.startsWith(url));
  });
}

/**
 * Ensures the URL always starts with `https://`
 */
export function getSafeUrl(url: string): string {
  return `https://${url.replace(/^(?:http(s)?:\/\/)?/i, "")}`;
}
