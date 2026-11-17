# Architecture

```text
 apps/web/
   React controls ── Web Worker ── packages/core/
      │                    │        └── NEAT genes, species and evolution
      │                    │                     │
      │                    └─────────────────────┤
      │                                          ▼
      │                              games/platformer/
      │                                ├── deterministic game physics and levels
      │                                ├── sensor observations
      │                                └── scoring and replay
      ├── Canvas 2D game replay and shared frame clock
      ├── Clean, offscreen Canvas (game pixels before UI overlays)
      ├── canvasCapture.ts (toBlob PNG and getImageData grayscale pixels)
      ├── LiveCircuit.tsx: 13×13 observation SVG → genome SVG → controller SVG
      ├── traceGenome(): same forward pass as training, with recorded action alignment
      ├── Three.js WebGPU neural-network renderer
      └── metrics + network graph

 packages/types/
   TypeScript and Zod contracts shared by packages/apps/games

 games/<next-game>/
   Dedicated workspace for each future game; no game-specific implementation in apps/

 docs/ — VitePress
 wiki/ — staged GitHub wiki pages
 todo.md — Orchestra task plan
```

All training and rendering happen **inside the user's browser**. No network service is used to run experiments.

The renderer first tries the Three.js WebGPU backend, and uses WebGL 2 on other supported browsers. The evolutionary algorithm runs independently in a worker; it is not dependent on graphics-processor availability.

## Extension adapters (future)

Separate `Environment` interface with methods equivalent to `reset`, `observe`, `step` and `score`, so future games can plug in without changing the NEAT engine. Games should have original or explicitly licensed assets.

A later Python training adapter can exchange JSON observations and episodes with Gymnasium and Stable-Baselines3; that will be an *optional separate backend*, not the dependency of the browser demo.
