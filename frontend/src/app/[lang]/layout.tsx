import type { Metadata } from "next";
import "./globals.css";
import { getStrapiMedia, getStrapiURL } from "./utils/api-helpers";
import { fetchAPI } from "./utils/fetch-api";

import { i18n, Locale } from "../../../i18n-config";
import Banner from "./components/Banner";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { FALLBACK_SEO } from "@/app/[lang]/utils/constants";
import type { Global, StrapiResponse } from "@/types/generated";
import { DictionaryProvider } from "@/contexts/DictionaryContext";
import { getDictionary, type Locale as DictionaryLocale } from "@/dictionaries";

async function getGlobal(lang: string): Promise<StrapiResponse<Global> | null> {
  const token = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

  if (!token) throw new Error("The Strapi API Token environment variable is not set.");

  const path = `/global`;
  const options = { headers: { Authorization: `Bearer ${token}` } };

  const urlParamsObject = {
    populate: [
      "metadata",
      "favicon",
      "notificationBanner.link",
      "navbar.links",
      "navbar.navbarLogo.logoImg",
      "footer.footerLogo.logoImg",
      "footer.menuLinks",
      "footer.legalLinks",
      "footer.socialLinks",
      "footer.categories",
    ],
    locale: lang,
  };
  return await fetchAPI(path, urlParamsObject, options);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  if (!i18n.locales.includes(lang as Locale)) {
    return FALLBACK_SEO;
  }

  const meta = await getGlobal(lang);

  if (!meta?.data) return FALLBACK_SEO;

  const { metadata, favicon } = meta.data;
  if (!metadata || !favicon) return FALLBACK_SEO;
  const { url } = favicon;

  return {
    title: metadata.metaTitle,
    description: metadata.metaDescription,
    icons: {
      icon: [new URL(url, getStrapiURL())],
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  readonly children: React.ReactNode;
  readonly params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  // Validate locale to prevent invalid requests (e.g., favicon.ico being treated as a locale)
  if (!i18n.locales.includes(lang as Locale)) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }

  const global = await getGlobal(lang);
  const dict = await getDictionary(lang as DictionaryLocale);

  const { notificationBanner, navbar, footer } = global?.data ?? {};

  // TODO: CREATE A CUSTOM ERROR PAGE
  if (!navbar || !footer) {
    return (
      <html lang={lang}>
        <body>
          <DictionaryProvider dict={dict} lang={lang}>
            <main className="dark:bg-black dark:text-gray-100 min-h-screen">{children}</main>
          </DictionaryProvider>
        </body>
      </html>
    );
  }

  const navbarLogoUrl = getStrapiMedia(navbar.navbarLogo?.logoImg?.url ?? null);

  const footerLogoUrl = getStrapiMedia(footer.footerLogo?.logoImg?.url ?? null);

  return (
    <html lang={lang}>
      <body>
        <DictionaryProvider dict={dict} lang={lang}>
          <Navbar
            links={navbar.links ?? []}
            logoUrl={navbarLogoUrl}
            logoText={navbar.navbarLogo?.logoText ?? null}
          />

          <main className="dark:bg-black dark:text-gray-100 min-h-screen">{children}</main>

          <Banner data={notificationBanner ?? null} />

          <Footer
            logoUrl={footerLogoUrl}
            logoText={footer.footerLogo?.logoText ?? null}
            menuLinks={footer.menuLinks ?? []}
            categoryLinks={footer.categories ?? []}
            legalLinks={footer.legalLinks ?? []}
            socialLinks={footer.socialLinks ?? []}
          />
        </DictionaryProvider>
      </body>
    </html>
  );
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}
