// Shared populate shape for article-list queries (blog index, category listing).
export const ARTICLE_LIST_POPULATE = {
  cover: { fields: ["url"] },
  category: { populate: "*" },
  authorsBio: { populate: "*" },
};
