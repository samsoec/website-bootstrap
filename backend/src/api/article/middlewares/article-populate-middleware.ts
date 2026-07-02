"use strict";

/**
 * `article-populate-middleware` middleware
 */

module.exports = (config, { strapi }) => {
  const { MEDIA_FIELDS } = require("../../../utils/media-populate-fields");

  return async (ctx, next) => {
    const populate = {
      blocks: {
        on: {
          'shared.media': {
            populate: {
              file: {
                fields: MEDIA_FIELDS,
              },
            },
          },
          'shared.quote': {
            populate: '*',
          },
          'shared.rich-text': {
            populate: '*',
          },
          'shared.slider': {
            populate: {
              files: {
                fields: MEDIA_FIELDS,
              },
            },
          },
          'shared.video-embed': {
            populate: '*',
          },
        },
      },
      cover: {
        fields: MEDIA_FIELDS,
      },
      category: {
        fields: ["name", "slug"],
      },
      authorsBio: {
        populate: {
          avatar: {
            fields: ["url", "alternativeText"],
          },
        },
      },
      seo: {
        fields: ["metaTitle", "metaDescription"],
        populate: { shareImage: true },
      },
    };
    
    ctx.query = {
      ...ctx.query,
      populate,
    };

    await next();
  };
};
