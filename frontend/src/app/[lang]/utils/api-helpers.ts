import { i18n } from "../../../../i18n-config";

export function getStrapiURL(path = "") {
  return `${process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"}${path}`;
}

export function getStrapiMedia(url: string | null) {
  if (url == null) {
    return null;
  }

  // Return the full URL if the media is hosted on an external provider
  if (url.startsWith("http") || url.startsWith("//")) {
    return url;
  }

  // Otherwise prepend the URL path with the Strapi URL
  return `${getStrapiURL()}${url}`;
}

export function formatDate(dateString: string, locale: string = i18n.defaultLocale) {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };

  // Map locale to BCP 47 language tag
  const localeMap: Record<string, string> = {
    en: "en-US",
    de: "de-DE",
    cs: "cs-CZ",
  };

  const bcp47Locale = localeMap[locale] || localeMap[i18n.defaultLocale];
  return date.toLocaleDateString(bcp47Locale, options);
}

// ADDS DELAY TO SIMULATE SLOW API REMOVE FOR PRODUCTION
export const delay = (time: number) => new Promise((resolve) => setTimeout(() => resolve(1), time));
