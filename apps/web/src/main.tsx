import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Activity,BookOpen,BrainCircuit,Camera,ChartNoAxesCombined,ChevronRight,CircleHelp,Download,Github,Pause,Play,RotateCcw,Scan,SkipForward,SlidersHorizontal,Workflow,Zap} from 'lucide-react';
import {PlatformCanvas,type PlatformCanvasHandle} from './PlatformCanvas';
import {downloadBrowserBlob,type PixelCapture} from './canvasCapture';
import {NetworkGPU} from './NetworkGPU';
import {LiveCircuit} from './LiveCircuit';
import {observePlatform,resetPlatform,traceGenome} from '@infinite-dimensions-ai/research-games-rl-core';
import type {EvolutionUpdate,Genome,ResearchConfig,WorkerUpdate} from '@infinite-dimensions-ai/research-games-rl-types';
import './style.css';

const initialConfig:ResearchConfig={seed:2026,populationSize:72,maxTicks:850,mutationRate:.8,addNodeRate:.18,addConnectionRate:.32};
const GITHUB='https://github.com/Infinite-Dimensions-AI/research-games-rl';
function GraphChart({history}:{history:number[]}){
  const samples=history.length?history:[0];const w=640,h=155;
  const peak=Math.max(10,...samples)*1.12;
  const path=samples.map((v,i)=>(i?'L':'M')+' '+(i/Math.max(1,samples.length-1)*w).toFixed(2)+' '+(h-(v/peak)*(h-14)).toFixed(2)).join(' ');
  return <svg className="chart" viewBox={'0 0 '+w+' '+h} preserveAspectRatio="none" aria-label="Best fitness by generation">
    <defs><linearGradient id="fitGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#62edca" stopOpacity=".24"/><stop offset="1" stopColor="#62edca" stopOpacity="0"/></linearGradient></defs>
    {[0,.25,.5,.75,1].map(x=><line key={x} x1="0" y1={x*h} x2={w} y2={x*h} stroke="#ffffff" opacity=".06"/>)}
    <path d={path+' L '+w+' '+h+' L 0 '+h+' Z'} fill="url(#fitGlow)"/>
    <path d={path} fill="none" stroke="#68f3ca" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinejoin="round"/>
    <circle cx={w} cy={h-(samples[samples.length-1]/peak)*(h-14)} r="5" fill="#8dfbe0"/>
  </svg>;
}
function App(){
  const worker=useRef<Worker|null>(null);
  const gameCanvas=useRef<PlatformCanvasHandle|null>(null);
  const [pixelCapture,setPixelCapture]=useState<PixelCapture|null>(null);
  const [captureMessage,setCaptureMessage]=useState('Screenshots and pixels are captured in your browser, without a server.');
  const saveScreenshot=async(clean=false)=>{
    try{
      const blob=await gameCanvas.current?.capturePng(clean);
      if(!blob)throw new Error('Game canvas is not ready.');
      const generation=snapshot?.generation??0;
      downloadBrowserBlob(blob,`research-games-gen-${generation}-${clean?'clean':'screen'}.png`);
      setCaptureMessage(`${clean?'Clean game':'Visible game'} PNG saved (${Math.round(blob.size/1024)} KB).`);
    }catch(e){setCaptureMessage(`Capture failed: ${e instanceof Error?e.message:String(e)}`);}
  };
  const inspectPixels=()=>{
    try{
      const data=gameCanvas.current?.samplePixels(64,36);
      if(!data)throw new Error('Game canvas is not ready.');
      setPixelCapture(data);
      setCaptureMessage(`Captured ${data.values.length} grayscale values directly from the clean Canvas.`);
    }catch(e){setCaptureMessage(`Pixel sampling failed: ${e instanceof Error?e.message:String(e)}`);}
  };
  const downloadPixels=()=>{
    if(!pixelCapture)return;
    const {preview,values,...meta}=pixelCapture;
    void preview;
    downloadBrowserBlob(new Blob([JSON.stringify({format:'idai-canvas-vision-v1',generation:snapshot?.generation??0,seed:config.seed,...meta,values:Array.from(values)},null,2)],{type:'application/json'}),`research-games-pixels-gen-${snapshot?.generation??0}.json`);
  };
  const [config,setConfig]=useState<ResearchConfig>(initialConfig);
  const [running,setRunning]=useState(false);
  const [snapshot,setSnapshot]=useState<EvolutionUpdate|null>(null);
  const [message,setMessage]=useState('Ready. Start the evolutionary experiment.');
  const [speed,setSpeed]=useState(1);
  const [showSensors,setShowSensors]=useState(true);
  const [replayPlaying,setReplayPlaying]=useState(true);
  const [backend,setBackend]=useState('initialising');
  const [playProgress,setPlayProgress]=useState(0);
  const [replayIndex,setReplayIndex]=useState(0);
  const [details,setDetails]=useState(false);
  useEffect(()=>{
    const w=new Worker(new URL('./trainer.worker.ts',import.meta.url),{type:'module'});
    worker.current=w;
    w.onmessage=(event:MessageEvent<WorkerUpdate>)=>{
      const data=event.data;
      if(data.type==='generation'){setSnapshot(data);setReplayIndex(0);setReplayPlaying(true);}
      if(data.type==='status'){setRunning(data.running);setMessage(data.message);}
      if(data.type==='error'){setRunning(false);setMessage('Training error: '+data.message);}
    };
    w.postMessage({type:'once',config:initialConfig});
    return()=>{w.postMessage({type:'pause'});w.terminate();worker.current=null;};
  },[]);
  const run=()=>{
    if(running){setRunning(false);setMessage('Pausing at the next generation boundary…');worker.current?.postMessage({type:'pause'});}
    else {worker.current?.postMessage({type:'start',config});setRunning(true);}
  };
  const once=()=>{if(!running)worker.current?.postMessage({type:'once',config});};
  const reset=()=>{
    worker.current?.postMessage({type:'reset',config});setSnapshot(null);setReplayIndex(0);setRunning(false);setMessage('Population reset with the chosen seed and configuration.');
  };
  const download=()=>{
    if(!snapshot)return;
    const blob=new Blob([JSON.stringify({format:'idai-neat-genome-v1',seed:config.seed,generation:snapshot.generation,fitness:snapshot.bestFitness,genome:snapshot.genome},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download='research-games-rl-champion-gen-'+snapshot.generation+'.json';link.click();
    window.setTimeout(()=>URL.revokeObjectURL(url),500);
  };
  const updateConfig=useCallback((field:keyof ResearchConfig,value:number)=>{
    setConfig(prev=>({...prev,[field]:value}));
    if(running)worker.current?.postMessage({type:'pause'});
  },[running]);
  const currentReplay=snapshot?.replay??[];
  const safeIndex=Math.min(replayIndex,Math.max(0,currentReplay.length-1));
  const currentFrame=currentReplay[safeIndex];
  const previousFrame=safeIndex>0?currentReplay[safeIndex-1]:null;
  const observation=useMemo(()=>{
    const initial=resetPlatform();
    const state=previousFrame?{...initial,x:previousFrame.x,y:previousFrame.y,tick:previousFrame.tick}:initial;
    return observePlatform(state);
  },[previousFrame]);
  const currentTrace=useMemo(()=>snapshot?.genome?traceGenome(snapshot.genome,observation):null,[snapshot?.genome,observation]);
  const actualButtons=currentFrame?.action??{left:false,right:false,jump:false};
  const n=snapshot?.genome?.nodes.length??173;
  const stats=[
    {label:'GENERATION',value:snapshot?.generation??0,sub:'training epochs'},
    {label:'BEST FITNESS',value:snapshot?.bestFitness.toFixed(1)??'0.0',sub:'furthest distance + goal'},
    {label:'SPECIES',value:snapshot?.species??0,sub:'distinct lineages'},
    {label:'CONNECTIONS',value:snapshot?.connections??0,sub:'evolved synapses'}
  ];
  return <div className="app-shell">
    <header className="nav">
      <div className="brand"><div className="brand-icon"><BrainCircuit size={23}/></div><div><span>INFINITE DIMENSIONS</span><strong>RESEARCH <em>/</em> GAMES</strong></div></div>
      <div className="nav-links"><a href="/research-games-rl/" title="VitePress documentation"><BookOpen size={16}/> DOCUMENTATION</a><a href={GITHUB} target="_blank" rel="noreferrer"><Github size={16}/> GITHUB</a><span className="nav-chip"><i/> EXPERIMENTAL</span></div>
    </header>
    <main>
      <section className="intro">
        <div className="eyebrow"><span className="eyebrow-line"/> EXPERIMENT 001 <ChevronRight size={13}/> NEUROEVOLUTION</div>
        <div className="heading"><div><h1>Learning to <span>play.</span></h1><p>A living laboratory for <b>NeuroEvolution of Augmenting Topologies (NEAT)</b> — watch neural networks evolve to navigate an original platform world, entirely inside your browser.</p></div><div className="intro-side"><span className="live-dot"/> BROWSER EXPERIMENT<br/><small>REPRODUCIBLE • SEED {config.seed}</small></div></div>
      </section>
      <section className="panel circuit-panel">
        <div className="panel-header"><div className="panel-title"><span className="panel-icon violet"><Workflow size={16}/></span><span>MAR I/O-STYLE LIVE VISUALISATION</span></div>
          <span className="soft-status">SENSOR INPUTS <strong>→</strong> NEURAL ACTIVATIONS <strong>→</strong> BUTTON PRESSES</span></div>
        <LiveCircuit genome={snapshot?.genome??null} observation={observation} trace={currentTrace}
          buttons={actualButtons} tick={previousFrame?.tick??0} generation={snapshot?.generation??0}/>
      </section>
      <div className="main-grid">
        <div className="left-stack">
          <section className="panel game-panel"><div className="panel-header"><div className="panel-title"><span className="panel-icon"><Zap size={16}/></span><span>01 — EVOLUTION ENVIRONMENT</span></div><span className="soft-status">ORIGINAL PLATFORMER <i/></span></div>
            <PlatformCanvas ref={gameCanvas} replay={snapshot?.replay??[]} speed={speed} playing={replayPlaying} showSensors={showSensors} onProgress={setPlayProgress} onFrame={setReplayIndex}/>
            <div className="panel-bar"><div className="icon-control"><button onClick={()=>setReplayPlaying(x=>!x)} aria-label={replayPlaying?'Pause champion replay':'Play champion replay'}>{replayPlaying?<Pause size={16}/>:<Play size={16}/>}</button><span>CHAMPION REPLAY</span></div><div className="replay-track"><div style={{width:(playProgress*100).toFixed(1)+'%'}}/></div><span className="small-count">×{speed}</span><button type="button" className="canvas-action" onClick={()=>void saveScreenshot(false)}><Camera size={15}/> Capture PNG</button><button type="button" className="canvas-action" onClick={inspectPixels}><Scan size={15}/> Sample pixels</button><label className="inline-toggle"><input type="checkbox" checked={showSensors} onChange={e=>setShowSensors(e.target.checked)}/> SENSOR GRID</label></div>
            <div className="capture-details">
              <span>{captureMessage}</span>
              {pixelCapture&&<div className="pixel-inspector">
                <img src={pixelCapture.preview} alt="64 by 36 pixel grayscale observation from the clean game Canvas"/>
                <div className="pixel-inspector-info">
                  <strong>PIXEL OBSERVATION · {pixelCapture.width} × {pixelCapture.height}</strong>
                  <span>{pixelCapture.values.length} normalized grayscale values, from 0 to 1. HUD and sensor-overlay pixels are excluded.</span>
                  <span>Mean brightness: {pixelCapture.mean.toFixed(3)} · NEAT still uses the structured 169-sensor baseline.</span>
                  <div className="pixel-actions">
                    <button type="button" onClick={()=>void saveScreenshot(true)}><Camera size={14}/> Clean PNG</button>
                    <button type="button" onClick={downloadPixels}><Download size={14}/> Pixels JSON</button>
                  </div>
                </div>
              </div>}
            </div>
          </section>
          <section className="panel graph-panel"><div className="panel-header"><div className="panel-title"><span className="panel-icon violet"><Workflow size={16}/></span><span>02 — EVOLVED NEURAL TOPOLOGY</span></div><span className="soft-status">169 INPUTS · 3 OUTPUTS</span></div>
            <NetworkGPU genome={snapshot?.genome??null} onBackend={setBackend}/>
            <div className="graph-footer"><div><i className="legend-teal"/>EXCITATORY <i className="legend-pink"/>INHIBITORY <i className="legend-violet"/>HIDDEN NEURONS</div><span>RENDERER: {backend.toUpperCase()} · {n} NODES</span></div>
          </section>
        </div>
        <aside className="right-stack">
          <section className="panel control-panel">
            <div className="panel-header"><div className="panel-title"><span className="panel-icon"><SlidersHorizontal size={16}/></span><span>TRAINING CONTROL</span></div><span className={'running-pill '+(running?'on':'')}>{running?'● RUNNING':'○ IDLE'}</span></div>
            <div className="control-content">
              <button className={'train-button '+(running?'stop':'')} onClick={run}>{running?<Pause size={18}/>:<Play size={18} fill="currentColor"/>}{running?'Pause evolution':'Start evolution'}<span>→</span></button>
              <div className="quick-buttons"><button disabled={running} onClick={once}><SkipForward size={15}/> Train 1 generation</button><button onClick={reset}><RotateCcw size={15}/> Reset</button></div>
              <div className="setting"><label>Population size <strong>{config.populationSize}</strong></label><input type="range" min={16} max={160} step={8} value={config.populationSize} onChange={e=>updateConfig('populationSize',Number(e.target.value))}/><small>Agents tested per generation · reset to apply</small></div>
              <div className="setting"><label>Replay speed <strong>{speed}×</strong></label><input type="range" min={1} max={8} step={1} value={speed} onChange={e=>setSpeed(Number(e.target.value))}/><small>Changes animation playback, not training rate</small></div>
              <div className="setting"><label>Random seed <strong>{config.seed}</strong></label><input aria-label="Random seed" type="number" min={1} max={2147483646} value={config.seed} onChange={e=>updateConfig('seed',Number(e.target.value)||1)}/><small>Deterministic runs for reproducibility</small></div>
              <p className="worker-status"><span className="pulse-tiny"/> {message}</p>
            </div>
          </section>
          <section className="stats-grid">{stats.map(stat=><div className="stat" key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong><small>{stat.sub}</small></div>)}</section>
          <section className="panel fitness-panel"><div className="panel-header"><div className="panel-title"><span className="panel-icon"><ChartNoAxesCombined size={16}/></span><span>FITNESS PROGRESSION</span></div><span className="soft-status">BEST SO FAR</span></div><div className="fitness-inner"><GraphChart history={snapshot?.history??[]}/><div className="axis"><span>GEN 0</span><span>{snapshot?.generation??0} GENERATIONS</span></div></div></section>
          <section className="panel methods-panel"><button className="methods-toggle" onClick={()=>setDetails(v=>!v)}><CircleHelp size={17}/> RESEARCH METHODOLOGY <ChevronRight size={16} className={details?'rotate':''}/></button>{details&&<p>This is a clean-room, simplified NEAT experiment: common initial topology, gene innovations, crossover, weight and structural mutation, fitness sharing, species, elitism and deterministic game episodes. The original video used a Lua emulator script; our game has original assets and physics. It is not identical to the reference implementation.</p>}
            <div className="methods-short"><span>VERSION 0.1 · EDUCATIONAL BASELINE</span><button disabled={!snapshot} onClick={download}><Download size={16}/> EXPORT CHAMPION</button></div>
          </section>
        </aside>
      </div>
      <footer className="footer"><span>INSPIRED BY SETHBLING'S 2015 MarI/O DEMONSTRATION · CLEAN-ROOM IMPLEMENTATION</span><div><Activity size={16}/> ORIGINAL ART · NO NINTENDO ROM OR ASSETS · WEB WORKER + {backend.toUpperCase()}</div></footer>
    </main>
  </div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
