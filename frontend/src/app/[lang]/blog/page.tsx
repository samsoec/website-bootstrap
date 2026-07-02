"use client";
import { useState, useEffect, useCallback } from "react";
import { fetchAPI } from "../utils/fetch-api";
import { getStrapiAuthHeaders } from "../utils/api-helpers";
import { ARTICLE_LIST_POPULATE } from "../utils/article-queries";
import type { Article } from "@/types/generated";

import Loader from "../components/Loader";
import Blog from "../views/blog-list";
import PageHeader from "../components/PageHeader";

interface Meta {
  pagination: {
    start: number;
    limit: number;
    total: number;
  };
}

export default function BlogPage() {
  const [meta, setMeta] = useState<Meta | undefined>();
  const [data, setData] = useState<Article[]>([]);
  const [isLoading, setLoading] = useState(true);

  const fetchData = useCallback(async (start: number, limit: number) => {
    setLoading(true);
    try {
      const path = `/articles`;
      const urlParamsObject = {
        sort: { createdAt: "desc" },
        populate: ARTICLE_LIST_POPULATE,
        pagination: {
          start: start,
          limit: limit,
        },
      };
      const options = { headers: getStrapiAuthHeaders() };
      const responseData = await fetchAPI(path, urlParamsObject, options);

      if (start === 0) {
        setData(responseData.data);
      } else {
        setData((prevData: Article[]) => [...prevData, ...responseData.data]);
      }

      setMeta(responseData.meta);
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  function loadMorePosts(): void {
    const nextPosts = meta!.pagination.start + meta!.pagination.limit;
    fetchData(nextPosts, Number(process.env.NEXT_PUBLIC_PAGE_LIMIT));
  }

  useEffect(() => {
    fetchData(0, Number(process.env.NEXT_PUBLIC_PAGE_LIMIT));
  }, [fetchData]);

  if (isLoading) return <Loader />;

  return (
    <div>
      <PageHeader heading="Our Blog" text="Checkout Something Cool" />
      <Blog data={data}>
        {meta!.pagination.start + meta!.pagination.limit < meta!.pagination.total && (
          <div className="flex justify-center">
            <button
              type="button"
              className="px-6 py-3 text-sm rounded-lg hover:underline dark:bg-gray-900 dark:text-gray-400"
              onClick={loadMorePosts}
            >
              Load more posts...
            </button>
          </div>
        )}
      </Blog>
    </div>
  );
}
