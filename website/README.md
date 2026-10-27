# Documentation site

Fumadocs with Next.js. The canonical API pages live in [content/docs/api](content/docs/api), with one Markdown file per public function.

From the repository root:

```sh
npm ci
npm run docs:dev
```

Open [localhost:3000/docs](http://localhost:3000/docs).

```sh
npm run docs:typecheck
npm run docs:build
```

The build exports the site and its search index to `website/out/`. Serve that directory on a static host, including its `_next/` assets. No server or search service is required.

## Railway deployment

The site runs at [temporal-fns-docs-production.up.railway.app/docs/](https://temporal-fns-docs-production.up.railway.app/docs/) in project `frantssb`, environment `production`, service `temporal-fns-docs`.

Railpack builds from the repository root with `npm run docs:build`. The service sets `RAILPACK_NODE_VERSION=24`, `RAILPACK_SPA_OUTPUT_DIR=website/out`, and `RAILPACK_NODE_INSTALL_PATTERNS=website/**` so the workspace's postinstall step can read its source files. The root `Staticfile` disables the SPA fallback so missing pages return HTTP 404. The health check uses `/docs/`.

Deploy from the repository root:

```sh
railway up --project b62c5679-8957-453d-b785-795045a745e2 --environment production --service temporal-fns-docs
```

## Editing

Edit the Markdown directly; changes appear in development. Update [api/meta.json](content/docs/api/meta.json) when adding or renaming an API page. Behavior links point to the Gherkin source on GitHub.

The app uses [@frantss/fumadocs-theme](https://www.npmjs.com/package/@frantss/fumadocs-theme) from npm for styles and layout components. The repository root lockfile covers the documentation workspace.
