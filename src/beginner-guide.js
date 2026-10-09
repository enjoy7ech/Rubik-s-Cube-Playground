import {apply,parseAlg} from './cube.js';
import {layerScores} from './layer-match.js';
import {yellowCrossStep,cornerSetup} from './beginner-teaching.js';
import {algorithms} from './tutorial-content.js';

export const stageNames=['底面十字','底面角块','中层棱块','顶层十字','小鱼翻顶面','短公式：角块归位','双小鱼：最后换棱'];
export const fixedFormulas=[null,algorithms.trigger,algorithms.right,algorithms.cross,algorithms.fish1,algorithms.corners,algorithms.edges];
export const leftInsert="U' L' U L U F U' F'";
const order=[0,1,2,3,4,5,6],upSetups=[[],['U'],["U'"],['U2']],yawSetups=[[],['y'],['y2'],["y'"]];
const orientations={D:[],U:['x2'],F:["x'"],B:['x'],R:['z'],L:["z'"]};
const centers=state=>new Map(state.filter(s=>s.p.filter(v=>v!==0).length===1).map(s=>[s.n.join(','),s.c]));
const signature=state=>state.map(s=>[...s.p,...s.n,s.c].join(',')).sort().join(';');
const wait=()=>new Promise(resolve=>setTimeout(resolve,0));
const earlierComplete=(state,stage)=>{const scores=layerScores(state);return order.slice(0,stage).every(index=>scores[index]===4)};
function macros(stage){
 const formulas=stage===2?[fixedFormulas[2],leftInsert]:[fixedFormulas[stage]],result=[];
 for(const formula of formulas)for(const yaw of yawSetups)for(const setup of stage===6?[[]]:upSetups)for(let repeats=1;repeats<=(stage===1?5:stage===5||stage===6?2:1);repeats++){
  const preparation=[...yaw,...setup],tokens=[...preparation,...Array.from({length:repeats},()=>parseAlg(formula)).flat()];
  result.push({preparation,formula,repeats,tokens,...(stage===6?{note:'完整面放在 B：右小鱼 → U → 左小鱼 → U′，连起来做，中途不换拿法。做完一组再观察；需要时重复同一组。'}:{})});
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
function fishStep(state){
 const count=layerScores(state)[4];
 for(const preparation of upSetups){
  const formula=fixedFormulas[4];
  const tokens=[...preparation,...parseAlg(formula)],after=apply(structuredClone(state),tokens),score=layerScores(after);
  const positioned=apply(structuredClone(state),preparation),normal=count===1?'0,1,0':count===0?'-1,0,0':'0,0,1',top=centers(state).get('0,1,0');
  if(!positioned.some(s=>s.p.join(',')==='-1,1,1'&&s.n.join(',')===normal&&s.c===top))continue;
  if(score.slice(0,4).every(n=>n===4))return[{preparation,formula,repeats:1,tokens,note:'只用这一条小鱼公式：摆好左前上角，完整做一次，再重新摆放、观察；顶面全同色就停。'}];
 }
 throw Error('Cannot recognize this fish orientation');
}
function cornerStep(state){
 const setup=cornerSetup(state),preparation=setup?.preparation||[];
 if(setup?.complete)return[{preparation,formula:null,repeats:0,tokens:preparation,note:'四个角已经在正确的位置，只转 U 对齐中心，不做换角公式。'}];
 const formula=fixedFormulas[5];
 return[{preparation,formula,repeats:1,tokens:[...preparation,...parseAlg(formula)],note:setup?'先只转 U 找到只有一个角位置正确的摆法，再转整个魔方，把这个角放左前上。做一次短公式；若三个角仍没好，保持拿法再做一次。':'转 U 也暂时找不到只有一个正确角的摆法：先任意方向完整做一次短公式，再重新寻找。'}];
}
export async function guideNext(snapshot,baseFace='D'){
 const preparation=orientations[baseFace]||[],state=apply(structuredClone(snapshot),preparation),scores=layerScores(state);
 const stage=order.findIndex(index=>scores[index]<4);
 if(stage<0)return{stage:7,scores,results:[]};
 const cross=stage===3?yellowCrossStep(state):null;
 const parts=stage===0?await daisyPlan(state):stage===3?[{preparation:cross.preparation,formula:fixedFormulas[3],repeats:1,tokens:[...cross.preparation,...parseAlg(fixedFormulas[3])],note:'摆成示意图的方向，做一次完整公式，然后重新观察。'}]:stage===4?fishStep(state):stage===5?cornerStep(state):await fixedPlan(state,stage);
 if(preparation.length)parts.unshift({preparation,formula:null,repeats:0,tokens:preparation,note:'先转整个魔方，把你选择的面放到底面 D。'});
 const tokens=parts.flatMap(part=>part.tokens),after=layerScores(apply(structuredClone(snapshot),tokens));
 return{stage,scores,teachingState:state,scoreIndex:order[stage],results:[{alg:tokens.join(' '),formula:stage===0?null:parts.find(p=>p.formula)?.formula||null,parts,after,gain:after[order[stage]]-scores[order[stage]],scoreIndex:order[stage]}]};
}
