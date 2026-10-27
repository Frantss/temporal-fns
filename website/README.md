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

Edit the Markdown directly; changes appear in development. Update [api/meta.json](content/docs/api/meta.json) when adding or renaming an API page. Behavior links point to the Gherkin source on GitHub.

The app uses [@frantss/fumadocs-theme](https://www.npmjs.com/package/@frantss/fumadocs-theme) from npm for styles and layout components. The repository root lockfile covers the documentation workspace.
