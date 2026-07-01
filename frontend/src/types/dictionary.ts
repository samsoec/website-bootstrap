/* eslint-disable @typescript-eslint/no-explicit-any */
import { getDictionary } from "@/dictionaries";

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

// Create a type for nested paths like "messages.error.somethingWentWrong"
type PathImpl<T, Key extends keyof T> = Key extends string
  ? T[Key] extends Record<string, any>
    ?
        | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>> & string}`
        | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
    : never
  : never;

type Path<T> = PathImpl<T, keyof T> | keyof T;

export type DictionaryPath = Path<Dictionary>;

// Helper to get nested value from object using dot notation
export function getNestedValue<T>(obj: T, path: string): any {
  return path.split(".").reduce((acc: any, part: string) => acc?.[part], obj);
}
