import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {WebGPURenderer} from 'three/webgpu';
import type {Genome} from '@infinite-dimensions-ai/research-games-rl-types';

type Props={genome:Genome|null;onBackend:(backend:string)=>void};
const color={input:0x3f8caa,bias:0xffd27e,hidden:0xb6a3ff,output:0x69e3c1};

export function NetworkGPU({genome,onBackend}:Props){
  const host=useRef<HTMLDivElement>(null);
  const sceneRef=useRef<THREE.Scene|null>(null);
  const groupRef=useRef<THREE.Group|null>(null);
  const graph=useRef<Genome|null>(genome);
  useEffect(()=>{graph.current=genome;const scene=sceneRef.current,group=groupRef.current;if(scene && group)populate(group,genome);},[genome]);
  useEffect(()=>{
    const container=host.current;if(!container)return;
    let disposed=false,frame=0;
    const scene=new THREE.Scene();
    sceneRef.current=scene;
    const camera=new THREE.PerspectiveCamera(44,1,0.1,100);
    camera.position.set(0,0,13);
    const group=new THREE.Group();
    scene.add(group);groupRef.current=group;
    populate(group,graph.current);
    let renderer:THREE.WebGLRenderer|WebGPURenderer|undefined;
    let resize:ResizeObserver|undefined;
    const mount=async()=>{
      if('gpu' in navigator){
        try{
          const gpu=new WebGPURenderer({antialias:true,alpha:true});
          await gpu.init();
          if(disposed){gpu.dispose();return;}
          renderer=gpu;onBackend('WebGPU');
        }catch{onBackend('WebGL2 fallback');}
      }
      if(!renderer){renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});onBackend('WebGL2 fallback');}
      if(disposed){renderer.dispose();return;}
      renderer.setPixelRatio(Math.min(devicePixelRatio,2));
      container.appendChild(renderer.domElement);
      resize=new ResizeObserver(()=>{
        if(!renderer)return;
        const {width,height}=container.getBoundingClientRect();
        if(!width||!height)return;
        camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);
      });
      resize.observe(container);
      const box=container.getBoundingClientRect();camera.aspect=box.width/Math.max(box.height,1);camera.updateProjectionMatrix();renderer.setSize(Math.max(1,box.width),Math.max(1,box.height));
      const tick=()=>{if(disposed||!renderer)return;group.rotation.y=Math.sin(performance.now()*.00024)*.18;group.rotation.x=Math.sin(performance.now()*.00017)*.07;renderer.render(scene,camera);frame=requestAnimationFrame(tick);};
      tick();
    };
    void mount();
    return()=>{disposed=true;cancelAnimationFrame(frame);resize?.disconnect();clearGroup(group);if(renderer){renderer.dispose();renderer.domElement.remove();}sceneRef.current=null;groupRef.current=null;};
  },[]);
  return <div className="gpu-graph" ref={host} role="img" aria-label="Live three-dimensional neural network topology visualisation using WebGPU or WebGL fallback"/>;
}
function nodePosition(id:number,depth:number):THREE.Vector3{
  if(id<169){
    const row=Math.floor(id/13),col=id%13;
    return new THREE.Vector3(-4.65+col*.13,(6-row)*.35,0);
  }
  if(id===169)return new THREE.Vector3(-2.7,-2.45,0);
  if(id<=172)return new THREE.Vector3(3.8,1.2-(id-170)*1.2,0);
  return new THREE.Vector3(-2.4+depth*5.5,Math.sin(id*2.4)*1.9,Math.cos(id*1.7)*.5);
}
function clearGroup(group:THREE.Group){
  for(const object of [...group.children]){
    group.remove(object);
    if(object instanceof THREE.Mesh || object instanceof THREE.LineSegments || object instanceof THREE.Line) {
      object.geometry?.dispose();
      const materials=Array.isArray(object.material)?object.material:[object.material];
      materials.forEach((m:THREE.Material)=>m.dispose());
    }
  }
}
function populate(group:THREE.Group,g:Genome|null){
  clearGroup(group);
  // Display a minimalist input/output topology before training starts.
  const nodes=g?.nodes??[
    ...Array.from({length:169},(_,id)=>({id,kind:'input' as const,depth:0})),
    {id:169,kind:'bias' as const,depth:0},
    ...Array.from({length:3},(_,i)=>({id:i+170,kind:'output' as const,depth:1}))
  ];
  const positions=new Map(nodes.map(n=>[n.id,nodePosition(n.id,n.depth)]));
  const smallGeometry=new THREE.SphereGeometry(.054,7,5);
  const materials=new Map<number,THREE.MeshBasicMaterial>();
  for(const [kind,hex] of Object.entries(color)){void kind;materials.set(hex,new THREE.MeshBasicMaterial({color:hex}));}
  for(const n of nodes){
    const p=positions.get(n.id)!;
    // Geometry/materials intentionally cloned so teardown is self-contained.
    const radius=n.kind==='input'?.065:n.kind==='output'?.14:.11;
    const mesh=new THREE.Mesh(smallGeometry.clone(),new THREE.MeshBasicMaterial({color:color[n.kind]}));
    mesh.scale.setScalar(radius/.054);mesh.position.copy(p);group.add(mesh);
  }
  smallGeometry.dispose();for(const mat of materials.values())mat.dispose();
  const positive:number[]=[],negative:number[]=[];
  for(const gene of g?.connections??[]){
    if(!gene.enabled)continue;
    const a=positions.get(gene.from),b=positions.get(gene.to);
    if(!a||!b)continue;
    const dest=gene.weight>=0?positive:negative;
    dest.push(...a.toArray(),...b.toArray());
  }
  for(const [points,shade] of [[positive,0x50eac5],[negative,0xff8a9d]] as const){
    if(!points.length)continue;
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
    const lines=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:shade,transparent:true,opacity:.65}));
    group.add(lines);
  }
}
