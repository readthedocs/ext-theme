# Workflow

- The CSS and JS under `readthedocsext/theme/static/readthedocsext/theme/` are build outputs committed to git. After changing LESS, JS, `.variables`, `.overrides` or `webpack.config.mjs`, run `npm run build` and commit the result. CI rebuilds and fails on any difference. Never edit those files by hand.
- Build from a clean checkout with the Node version in `.circleci/config.yml`; `package.json` enforces it with `engine-strict`. Uncommitted changes or a `node_modules` symlink produce different hashes than CI.
- Lint with the versions pinned in `.pre-commit-config.yaml`: `pre-commit run --files <changed files>` runs djlint for templates and prettier for everything else. Newer djlint releases reformat differently.
- Keep pull requests small and incremental, one concern each. Test UI changes in a local dev instance before asking for review, and include screenshots.
- `AGENTS.md` is synced from readthedocs/common. Put conventions that only apply to this repository in `.claude/rules/`, not there.
