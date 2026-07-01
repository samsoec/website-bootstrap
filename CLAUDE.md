# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack site: a **Strapi v5** headless CMS backend (`backend/`) and a **Next.js 16** (App Router) frontend (`frontend/`), connected by an auto-generated TypeScript type layer. The root `package.json` orchestrates both.

## Commands

Run from the repo root (uses yarn under the hood via root scripts):

```bash
yarn setup          # install deps for root, frontend, and backend + sync types
yarn dev             # clear frontend cache, then run frontend + backend concurrently
yarn frontend        # run frontend dev server only
yarn backend         # run backend dev server only
yarn types:sync      # regenerate frontend types from backend schemas
yarn seed            # import starter.tar.gz into Strapi (cd backend && strapi import)
yarn export          # export current Strapi content to ../starter (no encryption)
yarn clear           # rm -rf frontend/.next and frontend/cache
```

Backend (`cd backend`):
```bash
npm run develop      # Strapi dev server with admin auto-reload (alias: dev)
npm run start         # production server
npm run build          # build admin panel
npm run seed:example  # node ./scripts/seed.js — seed DB with example data
```

Frontend (`cd frontend`):
```bash
npm run dev           # next dev --webpack (webpack, not Turbopack — required by Nextra/Pagefind for the /docs site)
npm run build          # next build --webpack, then builds the Pagefind search index for /docs
npm run lint            # eslint
npm run format          # prettier --write src/**/*.{ts,tsx,js,jsx,json}
npm run format:check
npm run types:sync     # node scripts/copyTypes.js — regenerate src/types/generated/index.ts
npm run types:check    # tsc --noEmit, first 30 lines of output
```

There is no test suite configured in either package — do not assume `npm test` exists.

### Internal CMS docs (`/docs`)

`frontend/src/app/docs/` is a [Nextra](https://nextra.site) documentation site for content editors, gated behind `/docs-login` using a signed-cookie session (`frontend/src/proxy.ts`, `frontend/src/app/api/docs-auth/`). Login authenticates against the Strapi Admin API (`/admin/login`), so there's no separate user store — any Strapi admin account can sign in. Set `DOCS_AUTH_SECRET` in `frontend/.env` (used to HMAC-sign the session cookie) to enable it. Docs content lives under `frontend/src/app/docs/**/*.mdx`; `_meta.ts` files control navigation and only list `start-here` and `warnings` out of the box — add more categories as the project's content model grows. This is why `next dev`/`next build` run with `--webpack` instead of Turbopack.

Dev URLs: frontend `http://localhost:3000`, Strapi API `http://localhost:1337/api`, Strapi admin `http://localhost:1337/admin`.

## Architecture

### Type generation is the integration point

`frontend/scripts/copyTypes.js` reads Strapi JSON schemas directly off disk — content types from `backend/src/api/*/content-types/*/schema.json` and reusable components from `backend/src/components/*/*.json` — and generates `frontend/src/types/generated/index.ts` (relations, enums, dynamic zones as unions, `StrapiResponse`/`StrapiListResponse` wrappers, no `.attributes` wrapper). It resolves `BACKEND_PATH` as `../../backend` relative to the script, so **frontend and backend must remain sibling directories**.

Whenever a content type or component schema changes in the backend (via admin panel or by hand-editing the JSON), run `yarn types:sync` (or `cd frontend && npm run types:sync`) before frontend TypeScript will reflect it. `src/types/generated/` is excluded from ESLint and Prettier — it's generated output, don't hand-edit it.

### Dynamic zone rendering (component-resolver)

Strapi "Page" and "Article" content types use dynamic zones (`contentSections` / blocks) whose entries carry a `__component` field like `sections.hero` or `elements.feature`. `frontend/src/app/[lang]/utils/component-resolver.tsx` takes that string, extracts the part after the dot, converts kebab-case to PascalCase, and does a `React.lazy(() => import(\`../components/${componentName}\`))`. **This means every Strapi component category (`sections.*`, `elements.*`, etc.) must have a matching PascalCase file under `frontend/src/app/[lang]/components/`** — e.g. `sections.hero` → `components/Hero.tsx`, `elements.testimonial` → `components/Testimonial.tsx`. Adding a new Strapi component without adding the corresponding frontend component will fail at render time (module not found).

Each resolved section is wrapped in `<section id={sectionId}>` (for anchor links, e.g. `#teams`) plus a `ScrollReveal` fade-in-on-scroll wrapper (`components/ScrollReveal.tsx`, CSS in `globals.css`) — both apply automatically to every new component with no extra wiring needed.

### Routing & locales

- `frontend/src/proxy.ts` is the locale-detection middleware: it inspects `Accept-Language` via `negotiator`/`@formatjs/intl-localematcher` against `frontend/i18n-config.ts` (`locales: ['en', 'de', 'cs']`, default `en`) and redirects unlocalized paths to `/{locale}/...`.
- Routes live under `frontend/src/app/[lang]/`. `[...slug]/page.tsx` is the catch-all for Strapi-driven pages: it calls `getPageBySlug(slug, lang)` (queries `/pages?filters[slug]=...&locale=...`) and renders `page.data[0].contentSections` through `componentResolver`.
- Blog routes are separate and explicit: `blog/page.tsx` (list), `blog/[category]/page.tsx`, `blog/[category]/[slug]/page.tsx` (article detail), backed by `views/blog-list.tsx` and `views/post.tsx`.
- `utils/fetch-api.tsx` / `utils/api-helpers.ts` centralize calls to the Strapi REST API (base URL from `NEXT_PUBLIC_STRAPI_API_URL`, bearer token from `NEXT_PUBLIC_STRAPI_API_TOKEN`). The `next.revalidate` window is configurable via `NEXT_PUBLIC_STRAPI_REVALIDATE_SECONDS` (default 60).
- `frontend/src/app/robots.ts` and `sitemap.ts` generate `/robots.txt` and `/sitemap.xml` at request time, querying Strapi directly for `pages` and `articles` slugs (`NEXT_PUBLIC_SITE_URL` controls the emitted host).
- `frontend/src/contexts/DictionaryContext.tsx` + `frontend/src/dictionaries/{en,de,cs}.json` provide a small translated-UI-string system (via `useDictionary()`/`t(...)`) for text that isn't Strapi content — distinct from Strapi's own per-locale content fields.

### Backend content model

Strapi content types (`backend/src/api/*`): `article`, `page`, `about`, `global` (site-wide navbar/footer/metadata singleton), `author`, `category`, `product-feature`, `lead-form-submission`. Reusable components (`backend/src/components/*`) are grouped by folder: `elements/`, `layout/`, `links/`, `meta/`, `sections/`, `shared/` — these folder names are the `__component` category prefix consumed by the resolver above.

### Starter data / environment sync

`starter/` and `starter.tar.gz` at the repo root hold an exportable snapshot of Strapi content (`yarn export` writes it, `yarn seed` imports it via `strapi import`) — used to bootstrap a fresh backend with sample content rather than starting from an empty DB.

Environment files (not committed): `backend/.env` (Strapi keys/secrets, DB config) and `frontend/.env` (`NEXT_PUBLIC_STRAPI_API_URL`, `NEXT_PUBLIC_STRAPI_API_TOKEN`, `NEXT_PUBLIC_STRAPI_FORM_SUBMISSION_TOKEN`, `NEXT_PUBLIC_PAGE_LIMIT`). See the respective `.env.example` files for the full variable list.

## Conventions

- Frontend formatting is Prettier-enforced (double quotes, semicolons, 100 print width, trailing commas `es5`) with format-on-save configured for VS Code.
- Tailwind CSS v3 is used with `@apply` support in CSS files.
- ESLint ignores `frontend/scripts/**` and `frontend/src/types/generated/**`.
