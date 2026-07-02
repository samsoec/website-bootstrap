import PageHeader from "@/app/[lang]/components/PageHeader";
import { fetchAPI } from "@/app/[lang]/utils/fetch-api";
import { getStrapiAuthHeaders } from "@/app/[lang]/utils/api-helpers";
import { ARTICLE_LIST_POPULATE } from "@/app/[lang]/utils/article-queries";
import BlogList from "@/app/[lang]/views/blog-list";

async function fetchPostsByCategory(filter: string) {
  try {
    const path = `/articles`;
    const urlParamsObject = {
      sort: { createdAt: "desc" },
      filters: {
        category: {
          slug: filter,
        },
      },
      populate: ARTICLE_LIST_POPULATE,
    };
    const options = { headers: getStrapiAuthHeaders() };
    const responseData = await fetchAPI(path, urlParamsObject, options);
    return responseData;
  } catch (error: unknown) {
    console.error(error);
  }
}

export default async function CategoryRoute({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const { data } = await fetchPostsByCategory(category);

  //TODO: CREATE A COMPONENT FOR THIS
  if (data.length === 0) return <div>Not Posts In this category</div>;

  const { name, description } = data[0]?.category;

  return (
    <div>
      <PageHeader heading={name} text={description} />
      <BlogList data={data} />
    </div>
  );
}

export async function generateStaticParams() {
  return [];
}
