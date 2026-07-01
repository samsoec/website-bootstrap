import { MetadataRoute } from "next";
import { i18n } from "../../i18n-config";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface PageItem {
  slug: string;
  updatedAt?: string;
}

interface ArticleItem {
  slug: string;
  updatedAt?: string;
  category?: { slug: string } | null;
}

async function fetchFromStrapi(path: string, params: Record<string, string> = {}) {
  const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

  const queryString = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)])
  ).toString();

  const url = `${baseUrl}/api${path}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 3600 }, // Revalidate sitemap every hour
  });

  if (!response.ok) {
    console.error(`Failed to fetch ${path}:`, response.statusText);
    return { data: [] };
  }

  return response.json();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];
  const defaultLocale = i18n.defaultLocale;

  // Home page for each locale
  for (const locale of i18n.locales) {
    sitemapEntries.push({
      url: `${SITE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: Object.fromEntries(i18n.locales.map((l) => [l, `${SITE_URL}/${l}`])),
      },
    });
  }

  // Pages: `slug` is not localized (pluginOptions.i18n.localized: false), so the
  // same slug is shared across every locale — only the locale path prefix changes.
  try {
    const pagesResponse = await fetchFromStrapi("/pages", {
      "fields[0]": "slug",
      "fields[1]": "updatedAt",
      locale: defaultLocale,
    });

    for (const page of (pagesResponse.data || []) as PageItem[]) {
      if (page.slug === "home") continue;

      const languages = Object.fromEntries(
        i18n.locales.map((locale) => [locale, `${SITE_URL}/${locale}/${page.slug}`])
      );

      for (const locale of i18n.locales) {
        sitemapEntries.push({
          url: `${SITE_URL}/${locale}/${page.slug}`,
          lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
          alternates: { languages },
        });
      }
    }
  } catch (error) {
    console.error("Error fetching pages for sitemap:", error);
  }

  // Articles are not localized in this project (see article schema) — the same
  // article is reachable under every locale prefix at /blog/:category/:slug.
  try {
    const articlesResponse = await fetchFromStrapi("/articles", {
      "fields[0]": "slug",
      "fields[1]": "updatedAt",
      "populate[category][fields][0]": "slug",
    });

    for (const article of (articlesResponse.data || []) as ArticleItem[]) {
      const categorySlug = article.category?.slug;
      if (!categorySlug) continue;

      for (const locale of i18n.locales) {
        sitemapEntries.push({
          url: `${SITE_URL}/${locale}/blog/${categorySlug}/${article.slug}`,
          lastModified: article.updatedAt ? new Date(article.updatedAt) : new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  } catch (error) {
    console.error("Error fetching articles for sitemap:", error);
  }

  return sitemapEntries;
}
