import{_ as s,o as e,c as n,a0 as p}from"./chunks/framework.BYCjvD8D.js";const u=JSON.parse('{"title":"Architecture","description":"","frontmatter":{},"headers":[],"relativePath":"architecture.md","filePath":"architecture.md"}'),t={name:"architecture.md"};function r(i,a,c,o,l,d){return e(),n("div",null,[...a[0]||(a[0]=[p(`<h1 id="architecture" tabindex="-1">Architecture <a class="header-anchor" href="#architecture" aria-label="Permalink to &quot;Architecture&quot;">​</a></h1><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span> apps/web/</span></span>
<span class="line"><span>   React controls ── Web Worker ── packages/core/</span></span>
<span class="line"><span>      │                    │        └── NEAT genes, species and evolution</span></span>
<span class="line"><span>      │                    │                     │</span></span>
<span class="line"><span>      │                    └─────────────────────┤</span></span>
<span class="line"><span>      │                                          ▼</span></span>
<span class="line"><span>      │                              games/platformer/</span></span>
<span class="line"><span>      │                                ├── deterministic game physics and levels</span></span>
<span class="line"><span>      │                                ├── sensor observations</span></span>
<span class="line"><span>      │                                └── scoring and replay</span></span>
<span class="line"><span>      ├── Canvas 2D game replay and shared frame clock</span></span>
<span class="line"><span>      ├── Clean, offscreen Canvas (game pixels before UI overlays)</span></span>
<span class="line"><span>      ├── canvasCapture.ts (toBlob PNG and getImageData grayscale pixels)</span></span>
<span class="line"><span>      ├── LiveCircuit.tsx: 13×13 observation SVG → genome SVG → controller SVG</span></span>
<span class="line"><span>      ├── traceGenome(): same forward pass as training, with recorded action alignment</span></span>
<span class="line"><span>      ├── Three.js WebGPU neural-network renderer</span></span>
<span class="line"><span>      └── metrics + network graph</span></span>
<span class="line"><span></span></span>
<span class="line"><span> packages/types/</span></span>
<span class="line"><span>   TypeScript and Zod contracts shared by packages/apps/games</span></span>
<span class="line"><span></span></span>
<span class="line"><span> games/&lt;next-game&gt;/</span></span>
<span class="line"><span>   Dedicated workspace for each future game; no game-specific implementation in apps/</span></span>
<span class="line"><span></span></span>
<span class="line"><span> docs/ — VitePress</span></span>
<span class="line"><span> wiki/ — staged GitHub wiki pages</span></span>
<span class="line"><span> todo.md — Orchestra task plan</span></span></code></pre></div><p>All training and rendering happen <strong>inside the user&#39;s browser</strong>. No network service is used to run experiments.</p><p>The renderer first tries the Three.js WebGPU backend, and uses WebGL 2 on other supported browsers. The evolutionary algorithm runs independently in a worker; it is not dependent on graphics-processor availability.</p><h2 id="extension-adapters-future" tabindex="-1">Extension adapters (future) <a class="header-anchor" href="#extension-adapters-future" aria-label="Permalink to &quot;Extension adapters (future)&quot;">​</a></h2><p>Separate <code>Environment</code> interface with methods equivalent to <code>reset</code>, <code>observe</code>, <code>step</code> and <code>score</code>, so future games can plug in without changing the NEAT engine. Games should have original or explicitly licensed assets.</p><p>A later Python training adapter can exchange JSON observations and episodes with Gymnasium and Stable-Baselines3; that will be an <em>optional separate backend</em>, not the dependency of the browser demo.</p>`,7)])])}const g=s(t,[["render",r]]);export{u as __pageData,g as default};
