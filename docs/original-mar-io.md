# Original MarI/O video and Lua implementation

## What the source actually shows

- [Video: MarI/O — Machine Learning for Video Games](https://www.youtube.com/watch?v=qv6UVOQ0F44), SethBling, published 13 June 2015. **Game:** Super Mario World.
- [SethBling's published gist listing](https://gist.github.com/SethBling). An accessible Lua copy contains a header identifying the original author, the **BizHawk** emulator, an approximately **13 × 13 tile neighbourhood**, and controller actions.
- [NeuroEvolution of Augmenting Topologies paper](https://nn.cs.utexas.edu/downloads/papers/stanley.ec02.pdf), Stanley & Miikkulainen (2002).

**Source restriction:** the widely circulated Lua script expressly asks not to be redistributed. This repository does not copy or translate its source code; it independently implements mathematical concepts described in the academic paper and uses original game data/art.

## Comparison with the reference GitHub project

The separately supplied [ifthenelse/Super-Mario-Bros-AI](https://github.com/ifthenelse/Super-Mario-Bros-AI) is **not the same software**:

- It targets **Super Mario Bros** on the Nintendo Entertainment System, not the Super Nintendo game in SethBling's video.
- It runs in Python using `stable-retro` and `neat-python`.
- Its observations include positions, velocity, enemy slots, a terrain grid and contextual features derived from emulator memory.
- It requires a locally supplied game ROM and is not browser-only.
- Its repository is not currently licensed for reuse in our source; we cite it as a reference rather than copying its code.

## Our clean-room reconstruction

The original experiment provides an educational design target, not a benchmark claim. Our version starts from a new deterministic platformer:

1. A moving robot observes a local terrain/enemy grid.
2. A feed-forward neural network outputs left/right/jump decisions.
3. The environment runs a complete episode.
4. Fitness is based primarily on progress and completion.
5. The evolutionary population undergoes selection, fitness sharing, crossover, weight mutation and structural mutation.
6. The best genome is replayed and its network shown graphically.

**Differences:** custom physics and hazards, three action outputs, simplified compatibility/reproduction, no emulator memory-reading and no copyrighted game content. The initial version is not validated as a numerically identical NEAT implementation.

## Important terminology

**NeuroEvolution of Augmenting Topologies (NEAT)** is the method applied to game policies. It is distinct from a **Mobile Ad Hoc Network (MANET)** routing algorithm, despite the coincidental connection to the author's 2004 networking dissertation.
