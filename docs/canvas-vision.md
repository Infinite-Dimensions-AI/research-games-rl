# Canvas screenshots and future vision-based NEAT

The game captures its **own HTML Canvas**. There are no Playwright screenshots, Python services, or server APIs involved in capture.

## What the buttons do

- **Capture PNG:** `HTMLCanvasElement.toBlob('image/png')` encodes the currently visible game, including overlays.
- **Sample pixels:** copies the clean game frame into a 64×36 in-memory Canvas using `drawImage()`, reads its `ImageData` with `getImageData()`, and produces 2,304 grayscale numbers.
- **Clean PNG:** saves the separately drawn clean game frame, captured before the diagnostic sensor grid and heads-up display.
- **Pixels JSON:** exports the sampled floating-point values and dimensions for inspecting/teaching.

Only browser-native APIs are used. Downloading requires an explicit click.

## Turning pixels into numbers

Every image pixel contains red (R), green (G), blue (B) and alpha (A), generally each from 0 to 255. Our simple grayscale value is:

```
L = (0.2126 × R + 0.7152 × G + 0.0722 × B) / 255
```

Where `L` is brightness between 0 and 1. The 64×36 image becomes a one-dimensional array of 2,304 numbers, ready to be consumed by a future pixel-sensing neural model. The UI shows this tiny image with enlarged pixels and gives you the mean brightness.

## What NEAT currently sees

The existing champion policy uses **169 structured game sensors** (a 13×13 collision/enemy grid), not the new 2,304-pixel observation. Sampling is implemented for inspection and export, **not yet wired into training**. The goal is to keep a verified reference implementation while we build the more difficult vision experiment.

## WebGPU later

The Canvas capture step does not require WebGPU. A future WebGPU compute implementation could batch neural forward passes in WebGPU Shading Language (WGSL), while evolutionary mutations and speciation stay on the CPU initially.

Don't call `toBlob()` on every simulation tick: compressing thousands of PNGs is not a practical training pipeline. Feed compact arrays (or GPU textures/buffers) directly to the model, benchmark GPU transfers, and compare against the current CPU Web Worker baseline. Our current GPU feature is Three.js **rendering**, not acceleration of NEAT itself.
