import { WEBSITES } from "~~/shared/constants/websites";

interface SubdomainInfo {
  subdomain?: string;
  url?: string;
  icon: string;
  label: string;
}

interface WebsiteInfo {
  url: string[];
  icon: string;
  label: string;
  subdomains?: Record<string, SubdomainInfo>;
}

/**
 * Finds matching website information from predefined `WEBSITES` constant based on URL
 */
export function getWebsiteInfo(websiteUrl: string) {
  const normalizedUrl = websiteUrl
    .toLowerCase()
    .replace(/^(?:https?:\/\/)?(?:www\.)?/i, ""); // Remove protocol and www

  // First try to match subdomains
  for (const site of Object.values(WEBSITES) as WebsiteInfo[]) {
    if (site.subdomains) {
      for (const subdomain of Object.values(site.subdomains)) {
        const mainDomain = site.url[0];
        const subdomainPrefix = subdomain.subdomain || subdomain.url;
        if (normalizedUrl.startsWith(`${subdomainPrefix}.${mainDomain}`)) {
          return {
            url: site.url,
            icon: subdomain.icon,
            label: subdomain.label,
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
