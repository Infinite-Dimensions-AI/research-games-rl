import type { AgentButtons, ConnectionGene, Genome, NodeGene, ResearchConfig } from "@infinite-dimensions-ai/research-games-rl-types";
import { INPUT_COUNT, runEpisode } from "@infinite-dimensions-ai/research-games-rl-platformer";

const BIAS_ID=INPUT_COUNT;
const OUTPUT_START=INPUT_COUNT+1;
const OUTPUT_COUNT=3;
const HIDDEN_START=OUTPUT_START+OUTPUT_COUNT;

export class Random {
  private state:number;
  constructor(seed:number){this.state=seed>>>0 || 1;}
  next():number{this.state=(this.state+0x6D2B79F5)>>>0;let t=this.state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;}
  between(min:number,max:number):number{return min+(max-min)*this.next();}
  choice<T>(arr:readonly T[]):T{return arr[Math.min(arr.length-1,Math.floor(this.next()*arr.length))];}
}
const clamp=(x:number)=>Math.tanh(Math.max(-25,Math.min(25,x)));

/**
 * Shared forward pass for training and the live MarI/O-style circuit visualisation.
 * The recorded decisions and the displayed activations use identical mathematics.
 */
function forwardPass(genome:Genome, sensory:number[], withTrace:boolean):NetworkTrace {
  if(sensory.length!==INPUT_COUNT)throw Error('Expected 169 grid inputs');
  const activation=new Map<number,number>();
  for(let i=0;i<INPUT_COUNT;i++)activation.set(i,sensory[i]??0);
  activation.set(BIAS_ID,1);
  const ordered=genome.nodes.filter(n=>n.kind==='hidden'||n.kind==='output').sort((a,b)=>a.depth-b.depth||a.id-b.id);
  const incoming=new Map<number,ConnectionGene[]>();
  for(const connection of genome.connections){
    if(!connection.enabled)continue;
    let entries=incoming.get(connection.to);
    if(!entries){entries=[];incoming.set(connection.to,entries);}
    entries.push(connection);
  }
  for(const node of ordered){
    const sum=(incoming.get(node.id)??[]).reduce((v,c)=>v+(activation.get(c.from)??0)*c.weight,0);
    activation.set(node.id,clamp(sum));
  }
  const outputs:[number,number,number]=[
    activation.get(OUTPUT_START)??0,
    activation.get(OUTPUT_START+1)??0,
    activation.get(OUTPUT_START+2)??0
  ];
  const buttons:AgentButtons={left:outputs[0]>0.25,right:outputs[1]>0.20,jump:outputs[2]>0.22};
  return {
    buttons,outputs,
    activations:withTrace?Object.fromEntries(activation):{}
  };
}

export type NetworkTrace={
  buttons:AgentButtons;
  outputs:[number,number,number];
  activations:Record<number,number>;
};
export function evaluateGenome(genome:Genome,sensory:number[]):AgentButtons {
  return forwardPass(genome,sensory,false).buttons;
}
/** Full per-node activation trace for the synchronized browser visualisations. */
export function traceGenome(genome:Genome,sensory:number[]):NetworkTrace {
  return forwardPass(genome,sensory,true);
}

export function compatibilityDistance(a:Genome,b:Genome):number {
  const aa=new Map(a.connections.map(c=>[c.innovation,c]));
  const bb=new Map(b.connections.map(c=>[c.innovation,c]));
  const all=new Set([...aa.keys(),...bb.keys()]);
  let unshared=0,matches=0,difference=0;
  for(const innovation of all){const x=aa.get(innovation),y=bb.get(innovation);if(x&&y){matches++;difference+=Math.abs(x.weight-y.weight);}else unshared++;}
  return unshared/Math.max(1,Math.max(aa.size,bb.size)/15)+(matches?0.4*difference/matches:0);
}
export type Species={id:number;representative:Genome;members:Genome[];score:number};
export class NeatTrainer {
  readonly config:ResearchConfig;
  readonly random:Random;
  population:Genome[]=[];
  generation=0;
  bestFitness=0;
  bestGenome:Genome|null=null;
  history:number[]=[];
  species:Species[]=[];
  private innovation=0;
  private nodeId=HIDDEN_START;
  private genomeId=0;
  private innovationMap=new Map<string,number>();
  private splitMap=new Map<number,number>();

  constructor(config:ResearchConfig){
    this.config=config;this.random=new Random(config.seed);
    // Common historic innovations allow initial genomes to belong to comparable species.
    const inputs=[BIAS_ID,6*13+3,6*13+6,6*13+9,3*13+8,9*13+8,9*13+4];
    const template=Array.from({length:OUTPUT_COUNT},(_,j)=>inputs.map(x=>({from:x,to:OUTPUT_START+j,innovation:this.getInnovation(x,OUTPUT_START+j)}))).flat();
    for(let i=0;i<config.populationSize;i++){
      this.population.push({
        id:++this.genomeId,fitness:0,speciesId:0,
        nodes:this.baseNodes(),
        connections:template.map(c=>({...c,weight:this.random.between(-2,2),enabled:true}))
      });
    }
  }
  private baseNodes():NodeGene[]{
    return [...Array.from({length:INPUT_COUNT},(_,id):NodeGene=>({id,kind:'input',depth:0})),
      {id:BIAS_ID,kind:'bias',depth:0},
      ...Array.from({length:OUTPUT_COUNT},(_,i):NodeGene=>({id:OUTPUT_START+i,kind:'output',depth:1}))];
  }
  private getInnovation(from:number,to:number):number{
    const key=from+':'+to;
    let id=this.innovationMap.get(key);
    if(id===undefined){id=++this.innovation;this.innovationMap.set(key,id);}
    return id;
  }
  private copy(genome:Genome):Genome{return{id:++this.genomeId,nodes:genome.nodes.map(n=>({...n})),connections:genome.connections.map(c=>({...c})),fitness:0,speciesId:0};}
  private mutateWeights(g:Genome):void{
    for(const c of g.connections)if(this.random.next()<this.config.mutationRate)
      c.weight=this.random.next()<0.88?c.weight+this.random.between(-0.42,0.42):this.random.between(-2,2);
  }
  private addConnection(g:Genome):void{
    const candidates=g.nodes.filter(n=>n.kind!=='output');
    const destinations=g.nodes.filter(n=>n.kind==='hidden'||n.kind==='output');
    for(let trial=0;trial<35;trial++){
      const from=this.random.choice(candidates),to=this.random.choice(destinations);
      if(from.depth>=to.depth-1e-8 || g.connections.some(c=>c.from===from.id&&c.to===to.id))continue;
      g.connections.push({from:from.id,to:to.id,weight:this.random.between(-2,2),enabled:true,innovation:this.getInnovation(from.id,to.id)});
      return;
    }
  }
  private addNode(g:Genome):void{
    const active=g.connections.filter(c=>c.enabled);
    if(active.length===0)return;
    const chosen=this.random.choice(active);
    const from=g.nodes.find(n=>n.id===chosen.from);
    const to=g.nodes.find(n=>n.id===chosen.to);
    if(!from||!to)return;
    chosen.enabled=false;
    let id=this.splitMap.get(chosen.innovation);
    if(id===undefined){id=this.nodeId++;this.splitMap.set(chosen.innovation,id);}
    if(g.nodes.some(n=>n.id===id))return;
    g.nodes.push({id,kind:'hidden',depth:(from.depth+to.depth)/2});
    const add=(src:number,dst:number,weight:number)=>{const innovation=this.getInnovation(src,dst);if(!g.connections.some(c=>c.innovation===innovation))g.connections.push({innovation,from:src,to:dst,weight,enabled:true});};
    add(from.id,id,1);
    add(id,to.id,chosen.weight);
  }
  private mutate(g:Genome):void{
    this.mutateWeights(g);
    if(this.random.next()<this.config.addConnectionRate)this.addConnection(g);
    if(this.random.next()<this.config.addNodeRate)this.addNode(g);
    if(this.random.next()<0.04 && g.connections.length){
      const c=this.random.choice(g.connections);
      c.enabled=!c.enabled;
    }
  }
  private crossover(first:Genome,second:Genome):Genome{
    const fitter=first.fitness>=second.fitness?first:second;
    const other=fitter===first?second:first;
    const otherGenes=new Map(other.connections.map(c=>[c.innovation,c]));
    const connections=fitter.connections.map(c=>{
      const alt=otherGenes.get(c.innovation);
      const source=alt && this.random.next()<0.5?alt:c;
      return {...source,enabled:(!c.enabled||(alt&&!alt.enabled))?this.random.next()<0.25:true};
    });
    const nodesById=new Map([...fitter.nodes,...other.nodes].map(n=>[n.id,n]));
    const retained=new Set<number>([...Array.from({length:HIDDEN_START},(_,i)=>i),...connections.flatMap(c=>[c.from,c.to])]);
    return {id:++this.genomeId,connections,nodes:[...retained].map(id=>({...nodesById.get(id)!})),fitness:0,speciesId:0};
  }
  private classify():void{
    const species:Species[]=[];
    for(const genome of this.population){
      let chosen=species.find(s=>compatibilityDistance(s.representative,genome)<3.2);
      if(!chosen){chosen={id:species.length+1,representative:genome,members:[],score:0};species.push(chosen);}
      chosen.members.push(genome);
      genome.speciesId=chosen.id;
    }
    for(const s of species){
      s.members.sort((a,b)=>b.fitness-a.fitness);
      // Fitness sharing normalises each species by its size.
      s.score=s.members.reduce((sum,g)=>sum+g.fitness/Math.max(1,s.members.length),0)+0.001;
    }
    this.species=species;
  }
  evaluate():{fitness:number;genome:Genome;species:number;replay:import("@infinite-dimensions-ai/research-games-rl-platformer").Episode["replay"]}{
    for(const genome of this.population){
      genome.fitness=runEpisode(input=>evaluateGenome(genome,input),this.config.maxTicks).fitness;
    }
    this.population.sort((a,b)=>b.fitness-a.fitness);
    const best=this.population[0];
    if(best.fitness>this.bestFitness||!this.bestGenome){
      this.bestFitness=best.fitness;this.bestGenome=this.copy(best);this.bestGenome.fitness=best.fitness;
    }
    this.classify();
    this.history.push(this.bestFitness);
    const replay=runEpisode(input=>evaluateGenome(this.bestGenome!,input),this.config.maxTicks,true).replay;
    const result={fitness:this.bestFitness,genome:this.bestGenome!,species:this.species.length,replay};
    this.generation++;
    return result;
  }
  reproduce():void{
    if(!this.species.length)this.classify();
    const newPopulation:Genome[]=[];
    // Protect one elite per species, but avoid an excessive species count.
    for(const s of [...this.species].sort((a,b)=>b.score-a.score).slice(0,Math.max(1,Math.floor(this.config.populationSize/5)))){
      newPopulation.push(this.copy(s.members[0]));
    }
    const pool=this.species.filter(s=>s.members.length>=1);
    const total=pool.reduce((v,s)=>v+s.score,0);
    const chooseSpecies=()=>{
      let x=this.random.next()*total;
      for(const s of pool){x-=s.score;if(x<=0)return s;}
      return pool[pool.length-1];
    };
    while(newPopulation.length<this.config.populationSize){
      const s=chooseSpecies();
      const parents=s.members.slice(0,Math.max(1,Math.ceil(s.members.length*0.55)));
      let child:Genome;
      if(parents.length>1 && this.random.next()<0.70)child=this.crossover(this.random.choice(parents),this.random.choice(parents));
      else child=this.copy(this.random.choice(parents));
      this.mutate(child);
      newPopulation.push(child);
    }
    this.population=newPopulation;
  }
}
