import { fetchAPI } from "@/app/[lang]/utils/fetch-api";
import { getStrapiAuthHeaders } from "@/app/[lang]/utils/api-helpers";
import Post from "@/app/[lang]/views/post";
import type { Metadata } from "next";

async function getPostBySlug(slug: string) {
  const path = `/articles`;
  const urlParamsObject = {
    filters: { slug },
    populate: {
      cover: { fields: ["url"] },
      authorsBio: { populate: "*" },
      category: { fields: ["name"] },
      blocks: {
        populate: {
          __component: "*",
          files: "*",
          file: "*",
          url: "*",
          body: "*",
          title: "*",
          author: "*",
        },
      },
    },
  };
  const options = { headers: getStrapiAuthHeaders() };
  const response = await fetchAPI(path, urlParamsObject, options);
  return response;
}

async function getMetaData(slug: string) {
  const path = `/articles`;
  const urlParamsObject = {
    filters: { slug },
    populate: { seo: { populate: "*" } },
  };
  const options = { headers: getStrapiAuthHeaders() };
  const response = await fetchAPI(path, urlParamsObject, options);
  return response.data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = await getMetaData(slug);
  const metadata = meta[0].seo;

  return {
    title: metadata.metaTitle,
    description: metadata.metaDescription,
  };
}

export default async function PostRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPostBySlug(slug);
  if (data.data.length === 0) return <h2>no post found</h2>;
  return <Post data={data.data[0]} />;
}

export async function generateStaticParams() {
  const path = `/articles`;
  const options = { headers: getStrapiAuthHeaders() };
  const articleResponse = await fetchAPI(
    path,
    {
      populate: ["category"],
    },
    options
  );

  return articleResponse.data.map(
    (article: {
      slug: string;
      category: {
        slug: string;
      };
    }) => ({ slug: article.slug, category: article.category.slug })
  );
}
