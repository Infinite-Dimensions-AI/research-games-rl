import { z } from "zod";

export const agentButtonsSchema = z.object({ left: z.boolean(), right: z.boolean(), jump: z.boolean() });
export type AgentButtons = z.infer<typeof agentButtonsSchema>;

export const researchConfigSchema = z.object({
  seed: z.number().int().default(2026),
  populationSize: z.number().int().min(8).max(500).default(72),
  maxTicks: z.number().int().min(100).max(5000).default(850),
  mutationRate: z.number().min(0).max(1).default(0.8),
  addNodeRate: z.number().min(0).max(1).default(0.18),
  addConnectionRate: z.number().min(0).max(1).default(0.32),
});
export type ResearchConfig = z.infer<typeof researchConfigSchema>;

export type NodeKind = "input" | "bias" | "hidden" | "output";
export type NodeGene = { id: number; kind: NodeKind; depth: number };
export type ConnectionGene = { innovation: number; from: number; to: number; weight: number; enabled: boolean };
export type Genome = { id: number; nodes: NodeGene[]; connections: ConnectionGene[]; fitness: number; speciesId: number };
export type PlatformState = { x: number; y: number; vy: number; tick: number; maxX: number; idle: number; alive: boolean; won: boolean; onGround: boolean };
export type ReplayPoint = { x: number; y: number; tick: number; won: boolean; alive: boolean; action: AgentButtons };
export type EvolutionUpdate = {
  type: "generation";
  generation: number;
  bestFitness: number;
  species: number;
  connections: number;
  hiddenNodes: number;
  genome: Genome;
  replay: ReplayPoint[];
  history: number[];
};
export type WorkerCommand =
 | { type: "start"; config: ResearchConfig }
 | { type: "pause" }
 | { type: "reset"; config: ResearchConfig }
 | { type: "once"; config: ResearchConfig };
export type WorkerUpdate =
 | EvolutionUpdate
 | { type: "status"; running: boolean; message: string }
 | { type: "error"; message: string };
