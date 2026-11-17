# Algorithm and mathematics

## State → policy → action

Every frame, a small observation vector describes local terrain and danger. There are **169 sensory inputs**, arranged in a 13 × 13 grid. One extra bias neuron is also available. Three output neurons select **left**, **right**, and **jump**.

A neural policy maps an observation vector to button presses:
```text
Local terrain/enemy occupancy
            ↓
Neural weights and topology
            ↓
Left / right / jump
            ↓
Deterministic game step
            ↓
New observations, progress and hazards
```

## Genome

A genome stores nodes and enabled/disabled connections. Each connection stores its source, destination, weight and global **innovation number**. Innovation markers allow genes inherited by separate lineages to be aligned during crossover.

## Structural mutation

- **Weight mutation:** perturb or replace a connection weight.
- **Add connection:** connect compatible, previously unconnected nodes while preserving feed-forward ordering.
- **Split connection:** disable a connection and insert a hidden node plus two replacement connections.
- **Enable/disable:** occasionally toggle a connection gene.

## Species

Genomes are clustered by structural/weight compatibility. Each species has a fitness share so novel structures are less likely to be eliminated immediately by established high-performing structures.

## Fitness

The current illustrative objective is:

```text
fitness = max(0, maximum horizontal progress − starting position)
        + 150 if the goal was reached
```

This objective is *not* asserted to reproduce the original Lua program. It can encourage reward hacking and overfitting; we will evaluate alternative reward/fitness definitions in future milestones.

## What it is and isn't

This v0.1 is **NEAT-inspired and implemented**, not a proof of canonical NEAT equivalence. It uses deterministic simulation, shared innovation tracking, species-based competition, crossover, elitism and structural mutation. It does not yet implement all original paper heuristics (such as sophisticated species staleness controls, adaptive distance thresholds or exhaustive population diversity experiments).

Neuroevolution optimises episodic performance by evolving populations. It is related to reinforcement learning by its control problem and reward/fitness feedback, but it is not gradient-based deep reinforcement learning.

## Later experiments

- Full canonical NEAT baseline including species stagnation and carefully reported mutation parameters.
- More challenging levels, randomized seeds and unseen-test scenarios.
- Pixel versus structured observations; convolutional neural networks.
- Deep Q-Networks, policy-gradient algorithms and modern actor–critic baselines.
- Python Gymnasium / Stable-Baselines3 bridge, **later**, not needed for the browser experiment.
- WebGPU compute acceleration for batch-friendly operators if profiling supports it.
