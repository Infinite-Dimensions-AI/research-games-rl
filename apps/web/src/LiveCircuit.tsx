import {useMemo} from 'react';
import type {AgentButtons,Genome} from '@infinite-dimensions-ai/research-games-rl-types';
import type {NetworkTrace} from '@infinite-dimensions-ai/research-games-rl-core';

type SignalProps={
  genome:Genome|null;
  observation:number[];
  trace:NetworkTrace|null;
  buttons:AgentButtons;
  tick:number;
  generation:number;
};
const inputIndex=(col:number,row:number)=>row*13+col;

function ObservationMap({observation,tick}:{observation:number[];tick:number}){
  const cell=17,offsetX=28,offsetY=42;
  const enemies=observation.filter(n=>n===-1).length;
  const obstacles=observation.filter(n=>n===1).length;
  return <div className="signal-module sensor-module">
    <div className="signal-head"><span className="signal-index">01</span><div><strong>LANDSCAPE + ENEMY INPUTS</strong><small>Live environment observation</small></div><span className="signal-meta">13 × 13</span></div>
    <svg viewBox="0 0 275 330" role="img" aria-label="Live thirteen by thirteen terrain and enemy sensor grid" className="sensor-svg">
      <defs><pattern id="sensor-grid" width={cell} height={cell} patternUnits="userSpaceOnUse"><path d={`M ${cell} 0 L 0 0 0 ${cell}`} fill="none" stroke="#6a7896" strokeOpacity=".2" strokeWidth=".7"/></pattern></defs>
      <rect x={offsetX-1} y={offsetY-1} width={221+2} height={221+2} rx="5" fill="#09101e" stroke="#4d6288" strokeOpacity=".68"/>
      {Array.from({length:169},(_,index)=>{
        const row=Math.floor(index/13),col=index%13;
        const value=observation[index]??0;
        const x=offsetX+col*cell,y=offsetY+row*cell;
        return <rect key={index} x={x+1} y={y+1} width={cell-2} height={cell-2} rx={value===0?0:2}
          fill={value<0?'#ff7b84':value>0?'#b7ddbc':'#111e32'} fillOpacity={value===0?.6:1}>
          <title>{`Sensor ${col},${row}: ${value<0?'Enemy':value>0?'Solid terrain':'Empty'}`}</title>
        </rect>;
      })}
      <rect x={offsetX+6*cell+1} y={offsetY+6*cell+1} width={cell-2} height={cell-2} rx="3" fill="#58d9ff" stroke="#ffffff" strokeWidth="1.5"/>
      <path d={`M ${offsetX+6*cell+8.5} ${offsetY+6*cell+5} v 7 M ${offsetX+6*cell+5} ${offsetY+6*cell+8.5} h7`} stroke="#09172c" strokeWidth="1.3"/>
      <text x="29" y="27" fill="#90a6c0" fontSize="10" letterSpacing="1.4">LOCAL SENSOR WINDOW</text>
      <text x="29" y="294" fontSize="11" fill="#9cb6cd">SOLID <tspan fill="#d3e2c6">{obstacles.toString().padStart(2,'0')}</tspan></text>
      <text x="153" y="294" fontSize="11" fill="#9cb6cd">ENEMIES <tspan fill="#ff838c">{enemies.toString().padStart(2,'0')}</tspan></text>
      <text x="29" y="314" fontSize="10" fill="#6d829c">INPUT STREAM / TICK {tick.toString().padStart(4,'0')}</text>
    </svg>
    <div className="sensor-legend"><span><i className="sensor-solid"/> Ground / obstacles</span><span><i className="sensor-danger"/> Enemy</span><span><i className="sensor-player"/> Player</span></div>
  </div>;
}

type Point={x:number;y:number};
function NetworkDiagram({genome,trace,generation}:{genome:Genome|null;trace:NetworkTrace|null;generation:number}){
  const {positions,connections,nodes}=useMemo(()=>{
    const xInput=25,yInput=26,w=155,h=272;
    const position=new Map<number,Point>();
    for(let i=0;i<169;i++){
      const row=Math.floor(i/13),col=i%13;
      position.set(i,{x:xInput+col*(w/12),y:yInput+row*(h/12)});
    }
    position.set(169,{x:195,y:317});
    [170,171,172].forEach((id,i)=>position.set(id,{x:694,y:86+i*82}));
    const hidden=genome?.nodes.filter(n=>n.kind==='hidden')??[];
    const min=Math.min(0,...hidden.map(n=>n.depth));
    const max=Math.max(1,...hidden.map(n=>n.depth));
    hidden.sort((a,b)=>a.depth-b.depth);
    hidden.forEach((n,i)=>position.set(n.id,{
      x:255+(n.depth-min)/(max-min||1)*325,
      y:53+((i+.5)/(hidden.length||1))*252
    }));
    return {
      positions:position,
      connections:genome?.connections.filter(c=>c.enabled)??[],
      nodes:genome?.nodes??[],
    };
  },[genome]);
  const activation=trace?.activations??{};
  return <div className="signal-module network-module">
    <div className="signal-head"><span className="signal-index">02</span><div><strong>EVOLVING NEURAL NETWORK</strong><small>Real genome connectivity and current activations</small></div><span className="signal-meta">GEN {generation}</span></div>
    <svg className="live-network-svg" viewBox="0 0 738 345" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Actual enabled genome connections with positive weights in green, negative weights in pink, and live neuron activations">
      <defs><linearGradient id="neat-scan" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#10273a"/><stop offset="1" stopColor="#112037"/></linearGradient></defs>
      <rect x="16" y="16" width="174" height="294" rx="7" fill="url(#neat-scan)" stroke="#254664" strokeWidth="1"/>
      <text x="24" y="12" fontSize="10" fill="#82a0bb" letterSpacing="1">169 SENSORY NODES</text>
      {Array.from({length:169},(_,id)=>{
        const p=positions.get(id)!;
        const signal=activation[id]??0;
        return <rect key={id} x={p.x-3.7} y={p.y-3.7} width="7.4" height="7.4" rx=".9"
          fill={signal<-.01?'#f5808a':signal>.01?'#a9dfb9':'#223a50'} fillOpacity={Math.abs(signal)<.01?.52:1}>
          <title>{`Input ${id}: ${signal}`}</title>
        </rect>;
      })}
      <g fill="none" stroke="#5a708f" strokeOpacity=".18" strokeDasharray="4 7">
        <path d="M 205 20 L 205 315 M 620 20 L 620 315"/>
      </g>
      {connections.map(c=>{
        const a=positions.get(c.from),b=positions.get(c.to);
        if(!a||!b)return null;
        const source=Math.abs(activation[c.from]??0);
        const active=Math.min(1,source*Math.abs(c.weight));
        const color=c.weight>=0?'#59ddbc':'#f77b91';
        return <line key={c.innovation} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
          stroke={color} strokeWidth={.85+Math.min(2.5,Math.abs(c.weight)*.8)}
          strokeOpacity={.12+.75*active} strokeLinecap="round">
          <title>{`Gene ${c.innovation}: ${c.from} → ${c.to}; weight ${c.weight.toFixed(2)}; input activity ${source.toFixed(2)}`}</title>
        </line>;
      })}
      {nodes.filter(n=>n.kind==='hidden').map(node=>{
        const p=positions.get(node.id)!;
        const a=activation[node.id]??0;
        return <g key={node.id}><circle cx={p.x} cy={p.y} r={8+Math.abs(a)*3} fill="#131c36" stroke={a>=0?'#68e6bd':'#ff8398'} strokeWidth="2"/>
          <circle cx={p.x} cy={p.y} r={4+Math.abs(a)*2} fill={a>=0?'#68e6bd':'#ff8398'} opacity={.25+Math.abs(a)*.65}/>
          <title>{`Hidden node ${node.id}: activation ${a.toFixed(3)}`}</title></g>;
      })}
      {[170,171,172].map((id,i)=>{
        const p=positions.get(id)!;
        const value=activation[id]??0;
        const labels=['LEFT','RIGHT','JUMP'];
        return <g key={id}>
          <rect x={p.x-9} y={p.y-9} width="18" height="18" rx="3" fill={value>.22?'#62e9c1':'#1c2c41'} stroke={value>.22?'#89fff0':'#64829f'} strokeWidth="2"/>
          <text x={p.x-15} y={p.y-21} textAnchor="middle" fill="#afc7da" fontSize="10" transform={`translate(15 0)`}>{labels[i]}</text>
          <text x={p.x-11} y={p.y+27} textAnchor="middle" fill={value>.22?'#71e4bb':'#8195a9'} fontSize="10" transform={`translate(11 0)`}>{value.toFixed(2)}</text>
          <title>{`${labels[i]}: activation ${value.toFixed(3)}`}</title>
        </g>;
      })}
      <circle cx="195" cy="317" r="5" fill="#e8c783"/>
      <text x="207" y="322" fill="#92a7c3" fontSize="10">BIAS</text>
      <text x="218" y="14" fill="#7993ae" fontSize="10" letterSpacing="1">ACTIVE / INACTIVE CONNECTIONS</text>
    </svg>
    <div className="network-legend"><span><i className="legend-teal"/> Positive weight</span><span><i className="legend-pink"/> Negative weight</span><span><i className="legend-violet"/> Evolved hidden node</span></div>
  </div>;
}

function ControllerSVG({buttons,trace}:{buttons:AgentButtons;trace:NetworkTrace|null}){
  const outputs=trace?.outputs??[0,0,0];
  const pressed=(key:keyof AgentButtons)=>buttons[key];
  return <div className="signal-module controller-module">
    <div className="signal-head"><span className="signal-index">03</span><div><strong>CONTROLLER OUTPUT</strong><small>Driven by the active genome</small></div><span className="signal-meta">SVG / LIVE</span></div>
    <svg viewBox="0 0 300 322" className="controller-svg" role="img" aria-label={`Controller: left ${pressed('left')?'pressed':'released'}, right ${pressed('right')?'pressed':'released'}, jump ${pressed('jump')?'pressed':'released'}`}>
      <text x="16" y="22" fill="#90a6c3" fontSize="11" letterSpacing="1.2">NEURAL OUTPUT → BUTTON STATE</text>
      <rect x="12" y="40" width="276" height="192" rx="40" fill="#1d2b42" stroke="#58708e" strokeWidth="2"/>
      <rect x="30" y="64" width="240" height="140" rx="48" fill="#131d30" stroke="#3a516e" strokeWidth="1"/>
      <path d="M 80 91 H 112 V 112 H 134 V 146 H 112 V 168 H 80 V 146 H 58 V 112 H 80 Z"
        fill="#354962" stroke="#7888a1" strokeWidth="2"/>
      <rect x="81" y="92" width="30" height="20" rx="3" fill="#344962"/>
      <rect x="81" y="147" width="30" height="20" rx="3" fill="#344962"/>
      <rect x="58" y="115" width="24" height="30" rx="4" fill={pressed('left')?'#65e5c4':'#16273a'}
        stroke={pressed('left')?'#b3ffe6':'#6c859c'} strokeWidth="2"/>
      <rect x="111" y="115" width="24" height="30" rx="4" fill={pressed('right')?'#65e5c4':'#16273a'}
        stroke={pressed('right')?'#b3ffe6':'#6c859c'} strokeWidth="2"/>
      <path d="M 66 130 l 9 -7 v 14 Z" fill={pressed('left')?'#0c3028':'#b1c6dc'}/>
      <path d="M 126 130 l -9 -7 v14 Z" fill={pressed('right')?'#0c3028':'#b1c6dc'}/>
      <circle cx="219" cy="124" r="31" fill={pressed('jump')?'#6af1c4':'#27445b'}
        stroke={pressed('jump')?'#caffeb':'#708aa3'} strokeWidth="3"/>
      <circle cx="219" cy="124" r="25" fill="none" stroke={pressed('jump')?'#0e614f':'#51728a'} strokeWidth="2"/>
      <text x="219" y="129" textAnchor="middle" fill={pressed('jump')?'#0e352c':'#c0d3e8'} fontWeight="bold" fontSize="14">A</text>
      <text x="219" y="171" textAnchor="middle" fill="#d0c7f9" fontWeight="bold" fontSize="12">JUMP</text>
      <rect x="130" y="179" width="36" height="7" rx="4" fill="#384d65"/>
      <circle cx="22" cy="195" r="3.5" fill={pressed('left')?'#5aeab9':'#61778d'}/>
      <circle cx="39" cy="195" r="3.5" fill={pressed('right')?'#5aeab9':'#61778d'}/>
      <circle cx="56" cy="195" r="3.5" fill={pressed('jump')?'#5aeab9':'#61778d'}/>
      {(['left','right','jump'] as const).map((key,i)=>{
        const y=250+i*23,value=outputs[i];
        return <g key={key}>
          <text x="20" y={y+11} fill="#b1c4da" fontSize="11">{key.toUpperCase()}</text>
          <rect x="93" y={y} width="139" height="13" rx="3" fill="#243951"/>
          <rect x="93" y={y} width={Math.max(1,Math.round(Math.max(0,(value+1)/2)*139))} height="13" rx="3" fill={pressed(key)?'#69e7bc':'#4d7992'} opacity=".92"/>
          <text x="283" y={y+11} fontSize="11" textAnchor="end" fill={pressed(key)?'#7cffcf':'#9db3c9'}>{pressed(key)?'ON':'OFF'}</text>
        </g>;
      })}
    </svg>
    <p className="controller-note">Buttons reflect the policy action recorded during this replay frame.</p>
  </div>;
}

export function LiveCircuit({genome,observation,trace,buttons,tick,generation}:SignalProps){
  return <div className="signal-grid">
    <ObservationMap observation={observation} tick={tick}/>
    <div className="signal-arrow" aria-hidden="true">→</div>
    <NetworkDiagram genome={genome} trace={trace} generation={generation}/>
    <div className="signal-arrow" aria-hidden="true">→</div>
    <ControllerSVG buttons={buttons} trace={trace}/>
  </div>;
}
