"use strict";

/**
 * `page-populate-middleware` middleware
 */

module.exports = (config, { strapi }) => {
  const { MEDIA_FIELDS, MEDIA_FIELDS_MINIMAL } = require("../../../utils/media-populate-fields");

  return async (ctx, next) => {
    const populate = {
      contentSections: {
        on: {
          'sections.hero': {
            populate: {
              picture: {
                fields: MEDIA_FIELDS,
              },
              buttons: {
                populate: true,
              },
            },
          },
          'sections.bottom-actions': {
            populate: {
              buttons: {
                populate: true,
              },
            },
          },
          'sections.feature-columns-group': {
            populate: {
              features: {
                populate: {
                  icon: {
                    fields: MEDIA_FIELDS_MINIMAL,
                  },
                },
              },
            },
          },
          'sections.feature-rows-group': {
            populate: {
              features: {
                populate: {
                  media: {
                    fields: MEDIA_FIELDS,
                  },
                },
              },
            },
          },
          'sections.testimonials-group': {
            populate: {
              testimonials: {
                populate: {
                  picture: {
                    fields: MEDIA_FIELDS,
                  },
                },
              },
            },
          },
          'sections.large-video': {
            populate: {
              video: {
                fields: MEDIA_FIELDS_MINIMAL,
              },
              poster: {
                fields: MEDIA_FIELDS_MINIMAL,
              },
            },
          },
          'sections.rich-text': {
            populate: '*',
          },
          'sections.pricing': {
            populate: {
              plans: {
                populate: ["product_features"],
              },
            },
          },
          'sections.lead-form': {
            populate: {
              submitButton: {
                populate: true,
              },
            },
          },
          'sections.features': {
            populate: {
              feature: {
                populate: {
                  media: {
                    fields: MEDIA_FIELDS,
                  },
                },
              },
            },
          },
          'sections.heading': {
            populate: '*',
          },
        },
      },
      seo: {
        fields: ["metaTitle", "metaDescription"],
        populate: { shareImage: true },
      },
      localizations: {
        fields: ["slug", "locale"],
      },
    };

    ctx.query = {
      populate,
      filters: { slug: ctx.query.filters?.slug },
      locale: ctx.query.locale,
    };

    await next();
  };
};
