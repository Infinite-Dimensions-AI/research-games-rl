# Live MarI/O-style visualisation

The [2015 MarI/O demonstration](https://www.youtube.com/watch?v=qv6UVOQ0F44) is the visual reference for a live left-to-right decision pipeline. Our implementation keeps the same **conceptual visual grammar**, with original artwork and a clean-room TypeScript algorithm.

## Live pipeline

```text
ACTUAL PRE-ACTION GAME STATE
        │
        ▼
  observePlatform()
  13 × 13 terrain + enemy sensors
        │
        ├── landscape / enemy SVG (169 cells)
        ▼
  traceGenome()  ← same feed-forward function as training
        │
        ├── SVG sensory nodes (169)
        ├── actual enabled gene connections
        ├── positive weights in green / negative in pink
        ├── live hidden neuron activations
        └── output neuron values
        │
        ▼
  LEFT / RIGHT / JUMP
        │
        ├── actual action recorded in ReplayPoint.action
        ├── controller SVG button illumination
        ▼
  stepPlatform()
        │
        ▼
  post-action position displayed in the game
```

## Frame synchronisation

The browser game replays exactly the same recorded episode as the visualization. For replay frame **n**, the landscape and neural activations are computed from the state **before** that action (frame n−1, or the initial reset state for n=0). Buttons are taken from the action actually executed on frame n, **not estimated from movement**.

The live circuit refreshes with the replay clock. The screen simulation and controller remain synchronised when replay is paused. A deterministic test explicitly verifies both the initial and second-frame policy correspondence.

## JavaScript / TypeScript Mario-style games investigated

- **[Super Mario TS (fkucukkara/mario)](https://github.com/fkucukkara/mario)** — TypeScript, Phaser 3, Vite, MIT-licensed code and procedurally generated placeholder graphics; suitable as a *future alternative gameplay backend*.
- **[MarioJS (aayushsharma-io/mariojs)](https://github.com/aayushsharma-io/mariojs)** — vanilla JavaScript with an MIT licence, but its art and gameplay may involve Nintendo intellectual property.
- **[Sprout Runner (carlomigueldy/sprout-runner)](https://github.com/carlomigueldy/sprout-runner)** — original browser platformer with no external game assets, suitable for studying general platforming mechanics.
- **[ifthenelse/Super-Mario-Bros-AI](https://github.com/ifthenelse/Super-Mario-Bros-AI)** — Python/stable-retro/neat-python, *not* a browser implementation.

The current production demo continues to use the **existing original TypeScript platform simulator** because a single shared game state is essential for honest training telemetry. A Phaser environment adapter is a later milestone: merely rendering an unrelated game while training on our original physics would create misleading visualisation.

## Graphics processor note

The three-panel neural-network visualisation is **SVG**. The side game is **Canvas 2D**, and the optional lower topology visualisation remains **WebGPU/WebGL via Three.js**. Training remains a **CPU Web Worker** task. Do not conflate WebGPU rendering with GPU-powered neuroevolution.

## Provenance and scope

No Nintendo ROMs, sprites or soundtrack, and no redistribution of SethBling's Lua program. This is a new educational implementation of graph topology evolution and real-time observation/action explanations.
