# Contributing

Thanks for your interest in improving `@wyre-ai/node-proofpoint-essentials`.

## Development setup

```bash
npm install
npm run build
npm test
```

## Workflow

1. Fork and branch from `main`.
2. Make your change, with tests. Tests use [MSW](https://mswjs.io/) to mock the Proofpoint
   Essentials API -- see `tests/mocks/` and `tests/fixtures/` for existing patterns.
3. Run the full check suite before opening a PR:
   ```bash
   npm run lint   # tsc --noEmit
   npm run build  # tsup
   npm test       # vitest run
   ```
4. Open a pull request against `main`.

## Commit messages

This repository releases via [semantic-release](https://semantic-release.gitbook.io/), driven
by [Conventional Commits](https://www.conventionalcommits.org/). Your commit type determines the
version bump:

- `fix:` -- patch release
- `feat:` -- minor release
- `feat!:` / `BREAKING CHANGE:` footer -- major release
- `chore:`, `docs:`, `test:`, `refactor:` -- no release

## Code style

- Zero runtime dependencies -- native `fetch` only.
- Read `response.text()` once, then `JSON.parse()` it -- never call both `response.json()` and
  `response.text()` on the same response.
- Keep resource classes thin: one class per API entity under `src/resources/`, delegating all
  HTTP concerns to `HttpClient`.

## Reporting issues

Open a [GitHub issue](https://github.com/WYRE-AI/node-proofpoint-essentials/issues) with
reproduction steps. Never include real credentials or customer data in an issue.
