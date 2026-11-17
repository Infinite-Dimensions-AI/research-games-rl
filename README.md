# Research Games — Reinforcement Learning 🎮

**Public research monorepo:** https://github.com/Infinite-Dimensions-AI/research-games-rl

A browser-only interactive research laboratory where an evolving artificial-intelligence agent learns to play original game environments using **NeuroEvolution of Augmenting Topologies (NEAT)** and later reinforcement-learning algorithms.

## First experiment: reproduce the ideas behind MarI/O

The starting point is [MarI/O — Machine Learning for Video Games](https://www.youtube.com/watch?v=qv6UVOQ0F44), published by SethBling in June 2015. The original demo used a Lua script under the BizHawk emulator to evolve neural networks playing **Super Mario World**.

Our first experiment is a **clean-room TypeScript implementation of the mathematical ideas**, **not a line-by-line Lua translation**. The original Lua script requests that it not be redistributed. Our platform world, physics, character and art are original, with **no copyrighted Nintendo ROMs/assets**.

The separate [ifthenelse/Super-Mario-Bros-AI](https://github.com/ifthenelse/Super-Mario-Bros-AI) Python project is an informative reference using Stable Retro and `neat-python` with the Nintendo Entertainment System version of the game. It is **not** the Lua source from the 2015 video. We reference it without copying its source.

## What's implemented in this first version?

- Deterministic original browser platformer with gaps, hazards, obstacles and a goal.
- Local **13×13 sensor grid**, 169 sensory neurons and a bias.
- Three actions: left, right and jump.
- Independently implemented feed-forward network evaluation, innovation-marked genes, speciation, crossover, elitism, fitness sharing and weight/structural mutation.
- Web Worker evolution loop; browser-only with pause, reset, single-generation training, seed, population and speed controls.
- **SethBling-style linked display:** 13×13 landscape/enemy SVG, evolving NEAT connection SVG with real activation traces, original controller SVG showing recorded left/right/jump actions, and synchronised platform-game replay.
- Live replay of the strongest policy and **Three.js WebGPU neural-topology renderer** with WebGL fallback.
- Browser-native Canvas screenshot PNGs, clean game-only images, and 64×36 grayscale pixel export (no Playwright or server).
- Fitness chart, species count, network size and champion JSON export.
- Tests and source-aware methods documentation.

**GPU clarification:** WebGPU renders the evolving network. The irregular genome evolution and physics simulation currently run on the browser CPU in a Web Worker. WebGPU compute acceleration is a later benchmarked research milestone, not a v0.1 claim.

## Structure

```text
apps/web/         React + Vite + TypeScript + Three.js WebGPU
games/platformer/  Original platform game, levels, physics, sensor observation and episode scoring
packages/types/   Shared publishable schema/types
packages/core/    NEAT-style algorithm, evolution, tests
docs/             VitePress research notes, deployed only manually
wiki/             Staged initial GitHub Wiki pages
scripts/          Local Git flow, tags, Pages packaging
.changeset/       Changesets for versioned private GitHub Packages
todo.md           Orchestra / idai-mcp-v2 plan
```

## Quick start

```bash
cd /Users/mitchy/Public/Code/@github/infinite-dimensions-ai/@research/research-games-rl
nvm use 24
corepack enable
corepack yarn install
corepack yarn dev
# Open http://127.0.0.1:5173/
```

## Test and build

```bash
corepack yarn test
corepack yarn typecheck
corepack yarn build
corepack yarn check
```

## Docs, Wiki and Pages

- [VitePress documentation](https://infinite-dimensions-ai.github.io/research-games-rl/) — **not live until the first deployment**.
- [Interactive game/demo](https://infinite-dimensions-ai.github.io/research-games-rl/demo/) — **not live until the first deployment**.
- [GitHub Wiki](https://github.com/Infinite-Dimensions-AI/research-games-rl/wiki) — enabled, first page needs publishing.
- [Original source study](./docs/original-mar-io.md) and [research methodology](./docs/methodology.md).
- [Algorithms and mathematics](./docs/algorithm.md).
- [Native Canvas screenshots, pixels and future WebGPU compute](./docs/canvas-vision.md).
- [Live visualisation: landscape → genome → controller and JS/TS game candidates](./docs/live-visualisation.md).
- [Full Git flow, Changesets, releases and Pages instructions](./docs/workflow.md).
- [Orchestra milestones — todo.md](./todo.md).

To publish docs after **you** make the initial commit/push: `corepack yarn docs:deploy` (an explicit push of compiled static artifacts to `gh-pages`). No GitHub Actions workflows have been created.

## Git flow and releases

`corepack yarn branch:feature my-experiment`, `corepack yarn branch:fix physics-bug` and `corepack yarn branch:release 0.2.0` create local branches. `corepack yarn check` validates locally. `corepack yarn changeset` records package changes, `corepack yarn release:prepare` versions without committing, `corepack yarn release:publish` manually publishes restricted GitHub Packages and `corepack yarn release:tag 0.2.0` creates a local Git tag.

Nothing here commits, pushes, merges or publishes packages automatically; you control those actions.

## Future games and learning algorithms

Build a reusable environment adapter before adding more games. Explore canonical NEAT, Deep Q-Networks, actor–critic methods and optional Python/Gymnasium/Stable-Baselines3 comparisons. Keep the original browser experience usable without the Python stack.

## Licence and attribution

Original implementation only; the MIT licence covers code created in this repository, **not** Nintendo games or SethBling's separately published Lua script. Educational inspiration is acknowledged with links. Results are not represented as original work from Rock AI in 2016.
