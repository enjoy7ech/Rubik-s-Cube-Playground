import {apply,parseAlg,move} from './cube.js';
import {layerScores} from './layer-match.js';
import {yellowCrossStep} from './beginner-teaching.js';

export const stageNames=['第一面十字','完成第一层','完成第二层','顶层十字','顶层角块归位','顶面同色','最后的棱块归位'];
export const fixedFormulas=[null,"R U R' U'","U R U' R' U' F' U F","F R U R' U' F'","U R U' L' U R' U' L","R' D' R D","R U' R U R U R U' R' U' R2"];
const order=[0,1,2,3,5,4,6],upSetups=[[],['U'],["U'"],['U2']],yawSetups=[[],['y'],['y2'],["y'"]];
const orientations={D:[],U:['x2'],F:["x'"],B:['x'],R:['z'],L:["z'"]};
const centers=state=>new Map(state.filter(s=>s.p.filter(v=>v!==0).length===1).map(s=>[s.n.join(','),s.c]));
const signature=state=>state.map(s=>[...s.p,...s.n,s.c].join(',')).sort().join(';');
const wait=()=>new Promise(resolve=>setTimeout(resolve,0));
const earlierComplete=(state,stage)=>{const scores=layerScores(state);return order.slice(0,stage).every(index=>scores[index]===4)};
function macros(stage){
 const formula=fixedFormulas[stage],result=[];
 for(const yaw of yawSetups)for(const setup of stage===6?[[]]:upSetups)for(let repeats=1;repeats<=(stage===1?5:stage===4||stage===6?2:1);repeats++){
  const preparation=[...yaw,...setup],tokens=[...preparation,...Array.from({length:repeats},()=>parseAlg(formula)).flat()];
  result.push({preparation,formula,repeats,tokens});
 }
 return result.sort((a,b)=>a.tokens.length-b.tokens.length);
}
async function fixedPlan(initial,stage){
 const pool=macros(stage),score=layerScores(initial)[order[stage]],maxDepth=stage===2?4:stage===3?3:2;
 const queue=[{state:initial,parts:[]}],seen=new Set([signature(initial)]);let checked=0;
 for(let head=0;head<queue.length;head++){
  const entry=queue[head];
  for(const part of pool){
   const next=apply(structuredClone(entry.state),part.tokens),parts=[...entry.parts,part];
   if(++checked%120===0)await wait();
   if(!earlierComplete(next,stage))continue;
   const after=layerScores(next),goal=stage>=3?after[order[stage]]===4:after[order[stage]]>score;
   if(goal)return parts;
   if(parts.length<maxDepth){const key=signature(next);if(!seen.has(key)){seen.add(key);queue.push({state:next,parts})}}
  }
 }
 throw Error('Fixed beginner method could not advance this state');
}
async function daisyPlan(initial){
 const state=structuredClone(initial),color=centers(state).get('0,-1,0'),parts=[];
 const petals=s=>s.filter(t=>t.c===color&&t.n[1]===1&&t.p.filter(v=>v!==0).length===2).length;
 const moves=['U','R','F','L','B','D'].flatMap(face=>[face,face+"'",face+'2']);let checked=0;
 while(petals(state)<4){
  const count=petals(state),queue=[{state:structuredClone(state),tokens:[]}],key=s=>s.filter(t=>t.c===color&&t.p.filter(v=>v!==0).length===2).map(t=>[...t.p,...t.n].join(',')).sort().join(';'),seen=new Set([key(state)]);let found=null;
  for(let head=0;head<queue.length&&!found;head++){
   const entry=queue[head];
   for(const token of moves){
    if(entry.tokens.at(-1)?.[0]===token[0])continue;
    const next=apply(structuredClone(entry.state),[token]),tokens=[...entry.tokens,token];
    if(++checked%180===0)await wait();
    if(petals(next)>count){found=tokens;break}
    if(tokens.length<4&&petals(next)>=Math.max(0,count-1)){const hash=key(next);if(!seen.has(hash)){seen.add(hash);queue.push({state:next,tokens})}}
   }
  }
  if(!found)throw Error('Cannot place a petal');
  apply(state,found);parts.push({preparation:found,formula:null,repeats:0,tokens:found,note:`把第 ${count+1} 条底色棱移到顶面，围住顶面中心。`});
 }
 for(const [face,normal] of [['F',[0,0,1]],['R',[1,0,0]],['B',[0,0,-1]],['L',[-1,0,0]]]){
  const side=centers(state).get(normal.join(',')),position=[normal[0],1,normal[2]];
  const fits=s=>s.some(t=>t.p.join(',')===position.join(',')&&t.n[1]===1&&t.c===color)&&s.some(t=>t.p.join(',')===position.join(',')&&t.n.join(',')===normal.join(',')&&t.c===side);
  const setup=upSetups.find(tokens=>fits(apply(structuredClone(state),tokens)));
  if(!setup)throw Error('Cannot align a petal');
  const tokens=[...setup,face+'2'];apply(state,tokens);
  parts.push({preparation:setup,formula:face+'2',repeats:1,tokens,note:'转顶层对齐棱的侧色，再把对应侧面转半圈，送到底面。'});
 }
 if(layerScores(state)[0]!==4)throw Error('Daisy method did not complete the cross');
 return parts;
}
function orientCorners(initial){
 const state=structuredClone(initial),top=centers(state).get('0,1,0'),formula=fixedFormulas[5],parts=[];let preparation=[];
 for(let corner=0;corner<4;corner++){
  const up=()=>state.some(s=>s.p.join(',')==='1,1,1'&&s.n[1]===1&&s.c===top);let repeats=0;
  while(!up()&&repeats<6){apply(state,parseAlg(formula));repeats++}
  if(!up())throw Error('Cannot orient this corner');
  if(repeats)parts.push({preparation,formula,repeats,tokens:[...preparation,...Array.from({length:repeats},()=>parseAlg(formula)).flat()],note:`右前上角：重复小循环 ${repeats} 次，让顶色朝上。`});
  else if(preparation.length)parts.push({preparation,formula:null,repeats:0,tokens:preparation,note:'这个角已朝上，只转顶层换下一个角。'});
  move(state,'U');preparation=['U'];
 }
 parts.push({preparation:['U'],formula:null,repeats:0,tokens:['U'],note:'最后转顶层回到原方向，检查前两层已恢复。'});
 if(!earlierComplete(state,6))throw Error('Corner cycles did not restore earlier layers');
 return parts;
}
export async function guideNext(snapshot,baseFace='D'){
 const preparation=orientations[baseFace]||[],state=apply(structuredClone(snapshot),preparation),scores=layerScores(state);
 const stage=order.findIndex(index=>scores[index]<4);
 if(stage<0)return{stage:7,scores,results:[]};
 const cross=stage===3?yellowCrossStep(state):null;
 const parts=stage===0?await daisyPlan(state):stage===3?[{preparation:cross.preparation,formula:fixedFormulas[3],repeats:1,tokens:[...cross.preparation,...parseAlg(fixedFormulas[3])],note:'摆成示意图的方向，做一次完整公式，然后重新观察。'}]:stage===5?orientCorners(state):await fixedPlan(state,stage);
 if(preparation.length)parts.unshift({preparation,formula:null,repeats:0,tokens:preparation,note:'先转整个魔方，把你选择的面放到底面 D。'});
 const tokens=parts.flatMap(part=>part.tokens),after=layerScores(apply(structuredClone(snapshot),tokens));
 return{stage,scores,teachingState:state,scoreIndex:order[stage],results:[{alg:tokens.join(' '),formula:fixedFormulas[stage],parts,after,gain:after[order[stage]]-scores[order[stage]],scoreIndex:order[stage]}]};
}
