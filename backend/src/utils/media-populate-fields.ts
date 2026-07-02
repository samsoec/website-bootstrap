// Shared Strapi `populate` field lists for media relations, reused across
// content-type populate middlewares (page, article) to avoid drift.
export const MEDIA_FIELDS = ["url", "alternativeText", "caption", "width", "height"];
export const MEDIA_FIELDS_MINIMAL = ["url", "alternativeText"];
