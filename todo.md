# Research Games — Orchestra task plan

**Project:** Infinite Dimensions AI — games reinforcement learning
**Repository:** https://github.com/Infinite-Dimensions-AI/research-games-rl
**Local path:** `@research/research-games-rl`
**Plan:** `@research/research-games-rl/todo.md`
**Version:** v0.1 initial scaffold

## M0 — Monorepo foundation

- [x] M0.1 Public GitHub repository and GitHub Wiki enabled
- [x] M0.2 Node 24, Yarn 4, Turborepo workspaces and shared versioned types
- [x] M0.3 Changesets, local-only Git flow and manual package scripts
- [x] M0.4 VitePress and GitHub Pages deployment scaffolding
- [x] M0.5 Initial source commit, v0.1.0 release, main push and GitHub Pages gh-pages publication (explicit user request)
- [ ] M0.6 Publish the first GitHub Wiki pages separately

## M1 — MarI/O-inspired browser experiment

- [x] M1.1 Research original 2015 video and supplied Python reference, document differences
- [x] M1.2 Clean-room, deterministic original platformer environment
- [x] M1.3 Original NEAT-inspired innovation markers, mutation, speciation, crossover and evolution
- [x] M1.4 Browser Worker training + genome fitness replay
- [x] M1.5 WebGPU/WebGL network renderer, platform view, fitness visualization and controls
- [x] M1.6 Verify complete Node 24 installation, type checks, tests and production documentation build
- [ ] M1.7 Browser functional smoke check: start, pause, step, replay, reset, export
- [x] M1.8 Live SVG landscape/enemy grid → NEAT network activations → controller connected to recorded replay actions
- [x] M1.9 Move original training platformer into independently versioned top-level games/platformer workspace
- [ ] M1.10 Optional browser adaptation of MIT-licensed TypeScript/Phaser Mario-style game with original, rights-cleared art
- [x] M1.11 Capture visible/clean game PNGs directly with Canvas and sample 64×36 grayscale pixel arrays
- [ ] M1.12 Train and benchmark a separate pixel-observation NEAT policy
- [ ] M1.13 Evaluate WebGPU compute shaders for batched inference

## M2 — Methodological validity

- [ ] M2.1 Fix random, always-right and manually planned baselines
- [ ] M2.2 Canonical NEAT compatibility, species stagnation and parameter study
- [ ] M2.3 Multiple seeds, holdout levels, confidence intervals and convergence benchmarks
- [ ] M2.4 Evaluate rewards, obstacles, generalisation, and species diversity

## M3 — Game gallery and reproducibility

- [ ] M3.1 Multiple original platform and arcade environments
- [ ] M3.2 Persist/import champions and replay checkpoints in browser
- [ ] M3.3 Publish reproducible results/plots

## M4 — WebGPU compute (not just rendering)

- [ ] M4.1 Profile worker evaluation and topology-heavy networks
- [ ] M4.2 Explore WebGPU kernel batch evaluation when efficient
- [ ] M4.3 Compare CPU Worker and WebGPU performance, energy and accuracy

## M5 — Separate Python backend, later

- [ ] M5.1 Gymnasium-compatible environment boundary
- [ ] M5.2 Stable-Baselines3 baseline (separate Python process, not browser-dependent)
- [ ] M5.3 Compare neuroevolution and deep reinforcement learning

## Orchestra handoff

Use `idai-mcp-v2` under registered project `@infinite-dimensions-ai`, reading this path before editing. Provide correlation ID, plan path and version, target milestone, and exactly one final Orchestra status of `COMPLETE`, `CONTINUE`, `BLOCKED` or `ERROR`. Update checkboxes only after validation. No Git commit, push, merge, tagging, deployment, publishing or persistent background server is authorised by this plan.
