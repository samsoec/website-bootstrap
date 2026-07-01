import Link from "next/link";
import type { Category, Article } from "@/types/generated";
import type { RouteParams } from "@/app/[lang]/blog/[category]/[slug]/layout";

function selectedFilter(current: string, selected: string) {
  return current === selected
    ? "px-3 py-1 rounded-lg hover:underline dark:bg-violet-700 dark:text-gray-100"
    : "px-3 py-1 rounded-lg hover:underline dark:bg-violet-400 dark:text-gray-900";
}

export default function ArticleSelect({
  categories,
  articles,
  params,
}: {
  categories: Category[];
  articles: Article[];
  params: RouteParams;
}) {
  return (
    <div className="p-4 rounded-lg dark:bg-gray-900 min-h-91.25 relative">
      <h4 className="text-xl font-semibold">Browse By Category</h4>

      <div>
        <div className="flex flex-wrap py-6 space-x-2 dark:border-gray-400">
          {categories.map((category: Category) => {
            if (!category.articles?.length) return null;
            return (
              <Link
                key={category.id}
                href={`/blog/${category.slug}`}
                className={selectedFilter(category.slug ?? "", params.category)}
              >
                #{category.name}
              </Link>
            );
          })}
          <Link href={"/blog"} className={selectedFilter("", "filter")}>
            #all
          </Link>
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-semibold">Other Posts You May Like</h4>
          <ul className="ml-4 space-y-1 list-disc">
            {articles.map((article: Article) => {
              return (
                <li key={article.id}>
                  <Link
                    rel="noopener noreferrer"
                    href={`/blog/${params.category}/${article.slug}`}
                    className={`${
                      params.slug === article.slug && "text-violet-400"
                    }  hover:underline hover:text-violet-400 transition-colors duration-200`}
                  >
                    {article.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
