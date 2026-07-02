import { fetchAPI } from "@/app/[lang]/utils/fetch-api";
import { getStrapiAuthHeaders } from "@/app/[lang]/utils/api-helpers";

export async function getPageBySlug(slug: string, lang: string) {
  const path = `/pages`;
  const urlParamsObject = { filters: { slug }, locale: lang };
  const options = { headers: getStrapiAuthHeaders() };
  return await fetchAPI(path, urlParamsObject, options);
}
