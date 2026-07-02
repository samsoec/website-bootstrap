import ArticleSelect from "@/app/[lang]/components/ArticleSelect";
import { fetchAPI } from "@/app/[lang]/utils/fetch-api";
import { getStrapiAuthHeaders } from "@/app/[lang]/utils/api-helpers";
import type { Category, Article } from "@/types/generated";

interface SideMenuData {
  articles: Article[];
  categories: Category[];
}

async function fetchSideMenuData(filter: string): Promise<SideMenuData | undefined> {
  try {
    const options = { headers: getStrapiAuthHeaders() };

    const categoriesResponse = await fetchAPI("/categories", { populate: "*" }, options);

    const articlesResponse = await fetchAPI(
      "/articles",
      filter
        ? {
            filters: {
              category: {
                name: filter,
              },
            },
          }
        : {},
      options
    );

    return {
      articles: articlesResponse.data,
      categories: categoriesResponse.data,
    };
  } catch (error: unknown) {
    console.error(error);
  }
}

export interface RouteParams {
  slug: string;
  category: string;
}

export default async function LayoutRoute({
  params,
  children,
}: {
  children: React.ReactNode;
  params: Promise<RouteParams>;
}) {
  const resolvedParams = await params;
  const { category } = resolvedParams;
  const sideMenuData = await fetchSideMenuData(category);

  if (!sideMenuData) {
    return <section>{children}</section>;
  }

  const { categories, articles } = sideMenuData;

  return (
    <section className="container p-8 mx-auto space-y-6 sm:space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 lg:gap-4">
        <div className="col-span-2">{children}</div>
        <aside>
          <ArticleSelect categories={categories} articles={articles} params={resolvedParams} />
        </aside>
      </div>
    </section>
  );
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
