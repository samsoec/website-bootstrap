import "server-only";
import { i18n } from "../../i18n-config";

const dictionaries = {
  en: () => import("./en.json").then((module) => module.default),
  de: () => import("./de.json").then((module) => module.default),
  cs: () => import("./cs.json").then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

export const getDictionary = async (locale: Locale) => {
  // Fallback to the default locale if the requested one is not supported
  const dictionaryLoader = dictionaries[locale] || dictionaries[i18n.defaultLocale as Locale];
  return dictionaryLoader();
};
