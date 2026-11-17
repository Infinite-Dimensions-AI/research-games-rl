# Platformer — original training game

This is the first independent game workspace under `games/`.

- Package: `@infinite-dimensions-ai/research-games-rl-platformer`
- Deterministic platform-world physics, level layout, enemies, collision, actions, observations and episodic fitness.
- The `13×13` landscape/enemy sensor grid is computed here, shared by the policy and the SVG visualisation.
- No Nintendo ROMs, graphics, source code or soundtrack are included. This is an original Mario-*style* educational platformer.
- Import `resetPlatform`, `observePlatform`, `stepPlatform`, `runEpisode` from this package.

The neural-network evolution engine belongs under `packages/core` and depends on the game workspace, keeping games and learning algorithms independently reusable.

Future game integrations go under `games/<game-slug>/`, with their own `package.json`, `src/` and optionally `assets/` and `tests/`. A shared environment adapter will standardise controls, observations and scoring across games.
