import {CubeScene} from './cube-scene.js';
import {createCube,parseAlg,inverse,apply,move,movePlan} from './cube.js';

export class AlgorithmPlayer{
 constructor(container){
  this.container=container;this.canvas=container.querySelector('canvas');this.scene=new CubeScene(this.canvas);this.version=0;this.size=3;this.state=createCube();this.tokens=[];this.index=0;this.playing=false;this.busy=false;this.animation=null;
  this.play=container.querySelector('[data-play]');this.previous=container.querySelector('[data-previous]');this.next=container.querySelector('[data-next]');this.reset=container.querySelector('[data-reset]');this.counter=container.querySelector('[data-counter]');this.steps=container.querySelector('[data-steps]');
  this.play.onclick=()=>this.playing?this.pause():this.start();this.previous.onclick=()=>{this.pause();if(!this.busy&&this.index>0)this.turn(inverse([this.tokens[this.index-1]])[0],-1)};this.next.onclick=()=>{this.pause();if(!this.busy&&this.index<this.tokens.length)this.turn(this.tokens[this.index],1)};this.reset.onclick=()=>this.load(this.alg,this.size);
  new ResizeObserver(()=>this.scene.resize()).observe(this.canvas);
 }
 load(alg,size){this.version++;this.playing=false;this.busy=false;this.animation=null;this.alg=alg;this.size=size;this.tokens=parseAlg(alg);this.index=0;this.state=apply(createCube(size),inverse(this.tokens),size);this.container.hidden=false;this.scene.renderer.setAnimationLoop(()=>{this.scene.controls.update();this.scene.renderer.render(this.scene.scene,this.scene.camera)});this.scene.resetView();this.render();this.scene.resize();this.update()}
 render(){this.scene.update(this.state,this.size,this.animation)}
 update(){this.counter.textContent=this.index+' / '+this.tokens.length;this.play.textContent=this.playing?'暂停':'播放';this.previous.disabled=this.busy||this.index===0;this.next.disabled=this.busy||this.index>=this.tokens.length;this.steps.innerHTML='';this.tokens.forEach((t,i)=>{const span=document.createElement('span');span.textContent=t;span.className=i===this.index?'current':i<this.index?'done':'';this.steps.append(span)});this.canvas.setAttribute('aria-busy',String(this.busy));}
 pause(){this.playing=false;clearTimeout(this.timeout);this.update()}
 start(){if(this.index>=this.tokens.length)this.load(this.alg,this.size);this.playing=true;this.update();if(!this.busy)this.turn(this.tokens[this.index],1)}
 turn(token,delta){const version=this.version,plan=movePlan(token,this.size),begin=performance.now(),duration=matchMedia('(prefers-reduced-motion: reduce)').matches?40:plan.turns===2?430:300;this.busy=true;this.update();const frame=now=>{if(version!==this.version)return;const t=Math.min(1,(now-begin)/duration),eased=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;this.animation={...plan,angle:plan.dir*plan.turns*Math.PI/2*eased};this.render();if(t<1)requestAnimationFrame(frame);else{this.animation=null;move(this.state,token,this.size);this.index+=delta;this.busy=false;this.render();if(this.index===this.tokens.length)this.playing=false;this.update();if(this.playing)this.timeout=setTimeout(()=>{if(version===this.version&&this.playing)this.turn(this.tokens[this.index],1)},160)}};requestAnimationFrame(frame)}
 close(){this.version++;this.pause();this.busy=false;this.animation=null;this.scene.renderer.setAnimationLoop(null)}
}
