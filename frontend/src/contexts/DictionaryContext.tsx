"use client";

import { createContext, useContext } from "react";
import type { Dictionary, DictionaryPath } from "@/types/dictionary";
import { getNestedValue } from "@/types/dictionary";
import { i18n } from "../../i18n-config";

interface DictionaryContextType {
  dict: Dictionary;
  lang: string;
}

// Create context with a default value to handle SSR/SSG
const defaultContextValue: DictionaryContextType = {
  dict: {} as Dictionary, // Type assertion for default empty state during SSR
  lang: i18n.defaultLocale,
};

const DictionaryContext = createContext<DictionaryContextType>(defaultContextValue);

export function DictionaryProvider({
  children,
  dict,
  lang,
}: {
  children: React.ReactNode;
  dict: Dictionary;
  lang: string;
}) {
  return <DictionaryContext.Provider value={{ dict, lang }}>{children}</DictionaryContext.Provider>;
}

export function useDictionary() {
  const context = useContext(DictionaryContext);

  const t = (path: DictionaryPath): string => {
    const value = getNestedValue(context.dict, path as string);

    if (typeof value !== "string") {
      console.warn(`Translation not found for path: ${path}`);
      return path as string;
    }

    return value;
  };

  return { t, lang: context.lang };
}
