---
layout: home
hero:
  name: "Research Games"
  text: "Evolution learns to play."
  tagline: "A public, interactive research laboratory for neuroevolution, reinforcement learning and browser computing."
  actions:
    - theme: brand
      text: Train in your browser
      link: /demo/
    - theme: alt
      text: Read the algorithm
      link: /algorithm
---
## First experiment — MarI/O-inspired neuroevolution

The [2015 MarI/O demonstration](https://www.youtube.com/watch?v=qv6UVOQ0F44) by SethBling shows evolving neural networks learning to play **Super Mario World**, using Lua inside the BizHawk emulator.

Our experiment is a **new TypeScript implementation** based on published NeuroEvolution of Augmenting Topologies principles, with an **original** game, terrain, character and physical rules. It is not a literal Lua translation, nor is it a Super Mario emulator.

- Evolving weights and network connections with genome innovation markers, speciation, crossover and fitness sharing.
- Deterministic episodes for reproducible comparisons.
- Game rendering in the browser, with a live 13×13 local sensor grid.
- Training in a Web Worker; WebGPU for Three.js neural-topology rendering when supported, with a WebGL 2 fallback.
- Export of the best genome as JSON.

**No server, Python runtime, original game ROM, Nintendo art, or hosted training service is required.**

[Explore the source review](./original-mar-io.md) · [Inspect methods](./methodology.md) · [Read the milestones](./roadmap.md)
