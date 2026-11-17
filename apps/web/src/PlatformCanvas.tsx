import {forwardRef,useCallback,useEffect,useImperativeHandle,useRef} from 'react';
import {captureCanvasPng, sampleCanvasPixels, type PixelCapture} from './canvasCapture';
import {BLOCKS,ENEMIES,GROUND_SEGMENTS,WORLD_END,enemyPositions,resetPlatform} from '@infinite-dimensions-ai/research-games-rl-core';
import type {ReplayPoint} from '@infinite-dimensions-ai/research-games-rl-types';

type Props={replay:ReplayPoint[];speed:number;showSensors:boolean;playing:boolean;onProgress?:(progress:number)=>void;onFrame?:(index:number)=>void};
export type PlatformCanvasHandle = {
  capturePng: (clean?:boolean) => Promise<Blob>;
  samplePixels: (width?:number,height?:number) => PixelCapture;
};
export const PlatformCanvas=forwardRef<PlatformCanvasHandle,Props>(function PlatformCanvas({replay,speed,showSensors,playing,onProgress,onFrame},handle){
  const cleanFrame=useRef<HTMLCanvasElement|null>(null);
  const canvas=useRef<HTMLCanvasElement|null>(null);
  const ref=useRef({replay,speed,playing,showSensors,onProgress,onFrame});
  const position=useRef(0);
  const capturePng=useCallback((clean=false)=>{
    const source=clean?cleanFrame.current:canvas.current;
    if(!source) return Promise.reject(new Error('Game canvas is not ready.'));
    return captureCanvasPng(source);
  },[]);
  const samplePixels=useCallback((width=64,height=36)=>{
    if(!cleanFrame.current) throw new Error('Game image is not ready.');
    return sampleCanvasPixels(cleanFrame.current,width,height);
  },[]);
  useImperativeHandle(handle,()=>({capturePng,samplePixels}),[capturePng,samplePixels]);
  useEffect(()=>{ref.current={replay,speed,playing,showSensors,onProgress,onFrame};},[replay,speed,playing,showSensors,onProgress,onFrame]);
  useEffect(()=>{position.current=0;onFrame?.(0);},[replay,onFrame]);
  useEffect(()=>{
    const element=canvas.current;if(!element)return;
    const ctx=element.getContext('2d');if(!ctx)return;
    const clean=document.createElement('canvas');cleanFrame.current=clean;
    let width=960,height=440,dpr=1,lastTime=0,lastSignal=0,lastFrame=0,animation=0;
    const resize=()=>{
      const r=element.getBoundingClientRect();
      width=Math.max(320,r.width);height=Math.max(240,r.height);
      dpr=Math.min(window.devicePixelRatio||1,2);
      element.width=Math.round(width*dpr);element.height=Math.round(height*dpr);
      clean.width=element.width;clean.height=element.height;
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    const observer=new ResizeObserver(resize);observer.observe(element);resize();
    const draw=(now:number)=>{
      const {replay:frames,speed,playing,showSensors,onProgress,onFrame}=ref.current;
      if(playing&&frames.length>0&&now-lastFrame>1000/(60*Math.max(0.1,speed))){
        const advance=Math.max(1,Math.floor((now-lastFrame)/(1000/(60*Math.max(0.1,speed)))));
        position.current=(position.current+advance)%frames.length;
        lastFrame=now;
      }else if(!lastFrame)lastFrame=now;
      const fallback=resetPlatform();
      const frame=frames[position.current]??{x:fallback.x,y:fallback.y,tick:0,alive:true,won:false};
      if(onProgress && now-lastTime>550){onProgress(frames.length?position.current/frames.length:0);lastTime=now;}
      if(onFrame && now-lastSignal>65){onFrame(position.current);lastSignal=now;}
      const scale=Math.max(31,Math.min(45,width/24)),midX=width*0.27;
      const cameraX=Math.max(0,frame.x-6);
      const tx=(x:number)=>midX+(x-cameraX-6)*scale;
      const groundY=height*.74;
      const ty=(y:number)=>groundY-y*scale;
      const bg=ctx.createLinearGradient(0,0,0,height);bg.addColorStop(0,'#8bcdf5');bg.addColorStop(0.65,'#c3e8ff');bg.addColorStop(1,'#f4e3a9');
      ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
      // Distant aurora and hills are original procedural scenery.
      ctx.fillStyle='#fffdf3c9';
      for(let i=0;i<15;i++){
        const x=((i*173-(cameraX*7)%Math.max(width,1))%width+width)%width;
        const y=36+(i*43)%Math.max(80,height*.45);
        ctx.fillRect(x,y,2+(i%3),2+(i%3));
      }
      const hills=(step:number,fill:string,h:number)=>{
        ctx.fillStyle=fill;ctx.beginPath();ctx.moveTo(0,height);
        for(let x=0;x<=width+step;x+=step)ctx.lineTo(x,groundY-h+Math.sin(x/117+cameraX/8)*17+Math.sin(x/71)*14);
        ctx.lineTo(width,height);ctx.closePath();ctx.fill();
      };
      hills(12,'#93cdb4',84);hills(9,'#4fa189',52);
      ctx.fillStyle='#6e4e38';ctx.fillRect(0,groundY+8,width,height-groundY);
      for(const [a,b] of GROUND_SEGMENTS){
        const x=tx(a),w=(b-a)*scale;
        ctx.fillStyle='#b9854e';ctx.fillRect(x,groundY,w,height-groundY+20);
        ctx.fillStyle='#45bd6b';ctx.fillRect(x,groundY-10,w,10);
        ctx.fillStyle='#287d5a';ctx.fillRect(x,groundY+3,w,6);
        ctx.strokeStyle='#5a392b50';ctx.lineWidth=1;
        for(let i=Math.max(0,x);i<x+w;i+=32){ctx.beginPath();ctx.moveTo(i,groundY+16);ctx.lineTo(i+20,groundY+42);ctx.stroke();}
      }
      for(const block of BLOCKS){
        const x=tx(block.x),y=ty(block.height);
        ctx.fillStyle='#d4a25d';ctx.fillRect(x,y,block.width*scale,block.height*scale);
        ctx.strokeStyle='#f7d89a';ctx.lineWidth=2;ctx.strokeRect(x,y,block.width*scale,block.height*scale);
      }
      const enemies=enemyPositions(frame.tick);
      enemies.forEach((enemy,i)=>{
        const x=tx(enemy),y=ty(0.55);
        ctx.save();ctx.translate(x,y);
        ctx.fillStyle='#dc6686';ctx.beginPath();ctx.roundRect(-13,-10,26,22,5);ctx.fill();
        ctx.fillStyle='#172437';ctx.fillRect(-6,-2,4,5);ctx.fillRect(4,-2,4,5);ctx.fillStyle='#f7a9bd';ctx.fillRect(-10,-7,20,3);ctx.restore();
      });
      // Destination marker.
      const gx=tx(WORLD_END);ctx.strokeStyle='#ffe095';ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(gx,ty(0));ctx.lineTo(gx,ty(3.2));ctx.stroke();
      ctx.fillStyle='#ffdf7c';ctx.beginPath();ctx.moveTo(gx,ty(3.2));ctx.lineTo(gx+35,ty(2.8));ctx.lineTo(gx,ty(2.45));ctx.closePath();ctx.fill();


      // The controllable character is an original small robotic explorer, not Nintendo art.
      const px=tx(frame.x),py=ty(frame.y+0.76);
      ctx.save();ctx.translate(px,py);
      ctx.fillStyle=frame.won?'#ffdf7c':'#eaffee';ctx.beginPath();ctx.roundRect(-15,-1,30,33,8);ctx.fill();
      ctx.fillStyle='#1b2944';ctx.fillRect(-10,7,20,11);
      ctx.fillStyle='#22b8b6';ctx.fillRect(-7,10,14,5);
      ctx.fillStyle='#fef5cc';ctx.fillRect(-7,0,14,4);
      ctx.fillStyle='#d26574';ctx.fillRect(-12,29,8,7);ctx.fillRect(4,29,8,7);
      ctx.restore();

      // Clean game-only frame: captured before diagnostic sensors and HUD are added.
      // This is what pixel-based agents should sample rather than leaking overlays.
      const rawContext=clean.getContext('2d');
      rawContext?.drawImage(element,0,0);

      if(showSensors){
        const box=scale*.74;
        ctx.font='10px monospace';
        for(let row=-6;row<=6;row++)for(let col=-6;col<=6;col++){
          const px=tx(Math.floor(frame.x)+col*.75)-box/2,worldY=Math.floor(frame.y)+row*.75;
          const py=ty(worldY)-box/2;
          const solid=worldY<0?GROUND_SEGMENTS.some(([a,b])=>Math.floor(frame.x)+col*.75>=a&&Math.floor(frame.x)+col*.75<=b):BLOCKS.some(b=>Math.floor(frame.x)+col*.75>=b.x&&Math.floor(frame.x)+col*.75<b.x+b.width&&worldY<b.height&&worldY>=0);
          const danger=enemies.some(x=>Math.abs(Math.floor(frame.x)+col*.75-x)<.5&&worldY>=0&&worldY<=.7);
          ctx.fillStyle=danger?'#fa718333':solid?'#7df4cd21':'#8ebdd00d';ctx.fillRect(px,py,box-1,box-1);
          if(danger){ctx.strokeStyle='#fa718399';ctx.strokeRect(px,py,box-1,box-1);}
        }
      }


      ctx.fillStyle='#06111cd8';ctx.beginPath();ctx.roundRect(18,16,220,60,10);ctx.fill();
      ctx.fillStyle='#a1b3ca';ctx.font='12px ui-monospace,monospace';ctx.fillText('RUN / ORIGINAL PLATFORMER',32,38);
      ctx.fillStyle='#fff';ctx.font='bold 18px ui-monospace,monospace';ctx.fillText('DISTANCE  '+Math.floor(frame.x).toString().padStart(2,'0')+' / '+WORLD_END,32,62);
      animation=requestAnimationFrame(draw);
    };
    animation=requestAnimationFrame(draw);
    return()=>{observer.disconnect();cancelAnimationFrame(animation);cleanFrame.current=null;};
  },[]);
  return <canvas className="platform-canvas" ref={canvas} aria-label="Original platformer gameplay and evolutionary agent replay"/>;
});
