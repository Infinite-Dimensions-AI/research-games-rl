import type { AgentButtons, PlatformState, ReplayPoint } from "@infinite-dimensions-ai/research-games-rl-types";

export const WORLD_END = 68;
export const GRID_RADIUS = 6;
export const INPUT_COUNT = (GRID_RADIUS * 2 + 1) ** 2; // 169 sensory cells
export const START_X = 2;
export const GROUND_SEGMENTS: ReadonlyArray<readonly [number, number]> = [
  [0, 12.3], [15.1, 29], [31.5, 48], [50.3, 71]
];
export const BLOCKS: ReadonlyArray<{x:number; width:number; height:number}> = [
  {x:20,width:1,height:1.1},
  {x:37,width:1,height:1.4},
  {x:57,width:0.9,height:1.1},
];
export const ENEMIES: ReadonlyArray<{x:number; span:number; speed:number}> = [
  {x:25,span:1.1,speed:0.043},
  {x:43,span:0.9,speed:0.061},
  {x:60,span:1.1,speed:0.053}
];

export function hasGround(x:number):boolean {
  return GROUND_SEGMENTS.some(([a,b])=>x>=a && x<=b);
}
export function enemyPositions(tick:number):number[] {
  return ENEMIES.map(e=>e.x+Math.sin(tick*e.speed)*e.span);
}
export function resetPlatform():PlatformState {
  return {x:START_X,y:0,vy:0,tick:0,maxX:START_X,idle:0,alive:true,won:false,onGround:true};
}
export function stepPlatform(state:PlatformState, action:AgentButtons):PlatformState {
  if(!state.alive || state.won) return state;
  const s:PlatformState={...state,tick:state.tick+1};
  const right=Number(action.right), left=Number(action.left);
  const dx=(right-left)*0.122;
  const previousX=s.x;
  const previousY=s.y;
  s.x=Math.max(0,Math.min(WORLD_END+1,s.x+dx));
  if(action.jump && s.onGround){s.vy=0.34;s.onGround=false;}
  s.vy-=0.020;
  s.y+=s.vy;

  // Solid obstacles. Horizontal impacts stop the player unless it jumps over.
  for(const block of BLOCKS){
    const touches=s.x+0.28 > block.x && s.x-0.28 < block.x+block.width;
    if(!touches)continue;
    const standingOnTop=previousY>=block.height-0.05 && s.y<=block.height && s.vy<=0;
    if(standingOnTop){s.y=block.height;s.vy=0;s.onGround=true;continue;}
    if(s.y<block.height-0.05 && s.y+0.75>0){
      if(dx>0)s.x=Math.min(s.x,block.x-0.29);
      else if(dx<0)s.x=Math.max(s.x,block.x+block.width+0.29);
    }
  }

  // Platforms support the player if the centre sits on solid ground.
  if(s.y<=0 && hasGround(s.x) && s.vy<=0){s.y=0;s.vy=0;s.onGround=true;}
  else if(s.y>0){s.onGround=false;}
  else if(!hasGround(s.x)){s.onGround=false;}

  for(const x of enemyPositions(s.tick)){
    if(Math.abs(s.x-x)<0.53 && s.y<0.8 && s.y>-0.7)s.alive=false;
  }
  if(s.y < -4)s.alive=false;
  if(s.x >= WORLD_END){s.won=true;s.alive=false;}
  if(s.x > s.maxX+0.12){s.maxX=s.x;s.idle=0;}else{s.idle+=1;}
  if(s.idle>120)s.alive=false;
  if(s.tick>1200)s.alive=false;
  if(!Number.isFinite(s.x)||!Number.isFinite(s.y)) throw Error('Non-finite platform state');
  if(previousX===s.x && previousY===s.y && s.onGround)s.idle+=1;
  return s;
}

function terrainAt(x:number,y:number):number {
  if(y<0)return hasGround(x)?1:0;
  if(BLOCKS.some(b=>x>=b.x && x<b.x+b.width && y>=0 && y<b.height))return 1;
  return 0;
}
export function observePlatform(state:PlatformState):number[] {
  const out:number[]=[];
  const enemies=enemyPositions(state.tick);
  for(let row=GRID_RADIUS;row>=-GRID_RADIUS;row--){
    for(let col=-GRID_RADIUS;col<=GRID_RADIUS;col++){
      const x=Math.floor(state.x)+col*0.75;
      const y=Math.floor(state.y)+row*0.75;
      const isEnemy=enemies.some(enemy=>Math.abs(x-enemy)<0.5 && y>=0 && y<=0.7);
      out.push(isEnemy?-1:terrainAt(x,y));
    }
  }
  return out;
}

export type Episode = {fitness:number;state:PlatformState;replay:ReplayPoint[]};
export function runEpisode(
  decide:(observation:number[])=>AgentButtons,
  maxTicks=850,
  record=false
):Episode {
  let s=resetPlatform();
  const replay:ReplayPoint[]=[];
  for(let t=0;t<maxTicks && s.alive && !s.won;t++){
    const action=decide(observePlatform(s));
    s=stepPlatform(s,action);
    if(record)replay.push({x:s.x,y:s.y,tick:s.tick,alive:s.alive,won:s.won,action});
  }
  const fitness=Math.max(0,s.maxX-START_X)+(s.won?150:0);
  return {fitness,state:s,replay};
}
