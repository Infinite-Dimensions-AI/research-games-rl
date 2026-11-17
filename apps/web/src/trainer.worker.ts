/// <reference lib="webworker" />
import {NeatTrainer} from "@infinite-dimensions-ai/research-games-rl-core";
import type {ResearchConfig,WorkerCommand,WorkerUpdate} from "@infinite-dimensions-ai/research-games-rl-types";

let trainer:NeatTrainer|null=null;
let active=false;
let loopInProgress=false;
function report(update:WorkerUpdate){self.postMessage(update);}
function init(config:ResearchConfig){trainer=new NeatTrainer(config);active=false;report({type:'status',running:false,message:'Population initialised. Press Train to begin evolution.'});}
function next(){
  if(!trainer)return;
  const result=trainer.evaluate();
  report({type:'generation',generation:trainer.generation,bestFitness:result.fitness,
    species:result.species,connections:result.genome.connections.length,
    hiddenNodes:result.genome.nodes.filter(n=>n.kind==='hidden').length,
    genome:result.genome,replay:result.replay,history:[...trainer.history]});
  trainer.reproduce();
}
async function run(){
  if(loopInProgress)return;
  loopInProgress=true;
  try{
    while(active){
      next();
      // Yield to the browser event loop so Pause/Reset messages can be processed.
      await new Promise<void>(resolve=>setTimeout(resolve,12));
    }
  }catch(error){
    active=false;report({type:'error',message:error instanceof Error?error.message:String(error)});
  }finally{loopInProgress=false;}
}
self.onmessage=(event:MessageEvent<WorkerCommand>)=>{
  const command=event.data;
  switch(command.type){
    case 'start':
      if(!trainer)init(command.config);
      active=true;report({type:'status',running:true,message:'Evaluating genomes in browser worker…'});void run();break;
    case 'pause':
      active=false;report({type:'status',running:false,message:'Paused. Evolution state retained.'});break;
    case 'reset':
      active=false;init(command.config);break;
    case 'once':
      if(active)return;
      if(!trainer)init(command.config);
      next();break;
  }
};
