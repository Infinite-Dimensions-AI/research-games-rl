import assert from 'node:assert/strict';
import test from 'node:test';
import {resetPlatform,stepPlatform,observePlatform,INPUT_COUNT,runEpisode,NeatTrainer,Random,compatibilityDistance,evaluateGenome,traceGenome} from '../src/index.ts';

test('deterministic randomness given seed',()=>{const a=new Random(17),b=new Random(17);assert.deepEqual([a.next(),a.next(),a.next()],[b.next(),b.next(),b.next()]);});
test('agent starts grounded, moves and receives the expected 13×13 observation',()=>{
 const s=resetPlatform();assert.equal(s.x,2);assert.equal(s.y,0);
 assert.equal(observePlatform(s).length,169);
 const next=stepPlatform(s,{left:false,right:true,jump:false});
 assert.ok(next.x>s.x);assert.ok(next.tick===1);
});
test('jump results in upward motion and gravity',()=>{
 const s=stepPlatform(resetPlatform(),{left:false,right:true,jump:true});
 assert.ok(s.y>0);assert.ok(s.vy>0);assert.equal(s.onGround,false);
});
test('episodes are reproducible and finite',()=>{
 const policy=()=>({left:false,right:true,jump:false});
 const a=runEpisode(policy,300,true);const b=runEpisode(policy,300,true);
 assert.equal(a.fitness,b.fitness);assert.deepEqual(a.replay,b.replay);
 assert.ok(a.fitness>=0);assert.ok(a.replay.length<=300);
});
test('NEAT reproduces, creates innovation genes and yields real genomes',()=>{
 const config={seed:42,populationSize:18,maxTicks:150,mutationRate:.8,addNodeRate:1,addConnectionRate:1};
 const neat=new NeatTrainer(config);
 const a=neat.evaluate();
 assert.ok(a.fitness>=0);assert.ok(a.species>=1);
 assert.equal(neat.population.length,18);
 const first=neat.population[0];const count=first.connections.length;
 neat.reproduce();
 assert.equal(neat.population.length,18);
 assert.ok(neat.population.some(g=>g.connections.length>count||g.nodes.some(n=>n.kind==='hidden')));
 assert.ok(compatibilityDistance(neat.population[0],neat.population[0])===0);
 assert.equal(Object.keys(evaluateGenome(neat.population[0],Array(INPUT_COUNT).fill(0))).length,3);
});
test('trace activations and recorded replay buttons agree with the training policy',()=>{
 const cfg={seed:52,populationSize:8,maxTicks:130,mutationRate:.8,addNodeRate:.18,addConnectionRate:.32};
 const trainer=new NeatTrainer(cfg);
 const {genome,replay}=trainer.evaluate();
 assert.ok(replay.length>0);
 const initial=resetPlatform();
 const observed=observePlatform(initial);
 const trace=traceGenome(genome,observed);
 assert.deepEqual(trace.buttons,evaluateGenome(genome,observed));
 assert.deepEqual(trace.buttons,replay[0].action);
 assert.equal(Object.keys(trace.activations).length,genome.nodes.length);
 const second=replay[1];
 if(second){const prev=replay[0];const input=observePlatform({...initial,x:prev.x,y:prev.y,tick:prev.tick});assert.deepEqual(evaluateGenome(genome,input),second.action);}
});
test('same seed produces identical first generation',()=>{
 const cfg={seed:123,populationSize:10,maxTicks:140,mutationRate:.8,addNodeRate:.18,addConnectionRate:.32};
 const a=new NeatTrainer(cfg).evaluate(),b=new NeatTrainer(cfg).evaluate();
 assert.equal(a.fitness,b.fitness);assert.equal(a.genome.connections[0].weight,b.genome.connections[0].weight);
});
