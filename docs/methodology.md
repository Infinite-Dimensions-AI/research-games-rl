# Research methodology

## Provenance and integrity

This project is inspired by the original 2015 public demonstration. It is a modern **retrospective educational implementation**, not a contemporaneous artifact from Rock AI in 2016.

Historical records, original author's work and modern reconstruction results should be kept separate in the professional research portfolio and doctoral application.

## Experimental controls

- Fix pseudo-random seeds and episode limits for reproducibility.
- Compare against random button policies, always-right baselines and simple hand-coded controllers.
- Run multiple independent seeds and report median, variance, convergence rates and wall-clock time.
- Validate on held-out level layouts. Training on one fixed course alone is insufficient evidence of generalisation.
- Record number of generations, genomes evaluated, best fitness, best progress, completion rate, network complexity and hardware/browser details.
- Test that structural evolution improves on weight-only evolution through ablations.

## Performance

The neuroevolution loop runs in a **Web Worker on the browser's CPU**. The network visualization uses **Three.js WebGPURenderer** when WebGPU is supported, or its WebGL alternative when unavailable. GPU rendering does **not** imply GPU-based network training.

Before introducing WebGPU compute shaders for training, benchmark fitness evaluation and genome processing, which are branch-heavy and highly variable in structure.

## Intellectual property

No Nintendo game assets, music, source ROMs, or emulator dumps are included. Do not copy SethBling's published Lua script into this repository: its header discourages redistribution. Refer to the original externally and implement from published principles with independent source.

The reference Python project is studied as another design, not copied into the new project. This repository's original implementation is covered by its own LICENSE.
