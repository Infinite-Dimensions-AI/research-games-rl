# Local Git and release workflow

Node.js 24, Corepack Yarn 4 and Turborepo:

```bash
nvm use 24
corepack enable
corepack yarn install
corepack yarn dev
corepack yarn test
corepack yarn check
```

No GitHub Actions or hosted continuous-integration runners are configured. Package scripts **cannot automatically run on a GitHub merge** unless a runner or hook is configured. You control Git yourself.

## Branches

```bash
corepack yarn branch:feature evolve-fitness
corepack yarn branch:fix collider-overlap
corepack yarn branch:release 0.2.0
```

The helper creates a **local** branch only, from a clean main working tree. You commit/push/open or merge pull requests yourself. Always run `corepack yarn check` before and after merging.

Optional local hook: `corepack yarn hooks:install`, which runs `check` when a local merge results in checked-out `main`.

## Changesets and package publishing

```bash
corepack yarn changeset
corepack yarn check
corepack yarn release:prepare
# Review version changes and commit yourself.
export GITHUB_PERSONAL_ACCESS_TOKEN='your_token'
corepack yarn release:publish
corepack yarn release:tag 0.2.0  # optional local tag only
```

Publication is **manual** to restricted GitHub Packages. Workspaces use `workspace:^` locally. Other projects install versioned `@infinite-dimensions-ai/research-games-rl-*` packages from GitHub Packages. The source code in this GitHub repository is public.

## GitHub Pages

```bash
corepack yarn docs:build
corepack yarn docs:deploy
```

This explicitly publishes built assets to the `gh-pages` branch. Once created, set repository Settings → Pages → Deploy from branch → `gh-pages` root.

Wiki initialisation: open the repository's Wiki in GitHub and create the first page; its separate `.wiki.git` repository can then be cloned and seeded from the local `wiki/` directory.

**Important:** GitHub Pages is public, unlike an authenticated private Infinite Dimensions research portal.
