import {apply,parseAlg} from './cube.js';
import {crossSteps} from './cross-guide.js';
export {inspect as layerScores};
export const stageNames=['第一面十字','完成第一层','完成第二层','顶层十字','顶面同色','顶层角块归位','最后的棱块归位'];
function inspect(state){
 const centers=new Map(state.filter(s=>s.p.filter(v=>v!==0).length===1).map(s=>[s.n.join(','),s.c]));
 const pieces=new Map();for(const s of state){const key=s.p.join(',');if(!pieces.has(key))pieces.set(key,[]);pieces.get(key).push(s)}
 const correct=s=>s.c===centers.get(s.n.join(',')),all=[...pieces.values()],cross=all.filter(p=>p[0].p[1]===-1&&p.length===2),corners=all.filter(p=>p[0].p[1]===-1&&p.length===3),middle=all.filter(p=>p[0].p[1]===0&&p.length===2),topEdges=all.filter(p=>p[0].p[1]===1&&p.length===2),topCorners=all.filter(p=>p[0].p[1]===1&&p.length===3);
 const count=p=>p.filter(piece=>piece.every(correct)).length,up=p=>p.filter(piece=>piece.find(s=>s.n[1]===1)?.c===centers.get('0,1,0')).length;
 return [count(cross),count(corners),count(middle),up(topEdges),up(topCorners),topCorners.filter(p=>p.map(s=>s.c).sort().join(',')===p.map(s=>centers.get(s.n.join(','))).sort().join(',')).length,count(topEdges)];
}
export async function matchLayer(snapshot,data,baseFace='D'){
 const orientation={D:[],U:['x2'],F:["x'"],B:['x'],R:['z'],L:["z'"]}[baseFace]||[];
 snapshot=apply(structuredClone(snapshot),orientation,3);
 const originalLetters=['U','D','R','L','F','B'],normalLetters={'0,1,0':'U','0,-1,0':'D','1,0,0':'R','-1,0,0':'L','0,0,1':'F','0,0,-1':'B'};
 const oriented=apply((await import('./cube.js')).createCube(),orientation,3),letterMap={};
 for(const center of oriented.filter(s=>s.p.filter(v=>v!==0).length===1))letterMap[normalLetters[center.n.join(',')]]=originalLetters[center.c];
 const scores=inspect(snapshot),stage=scores.findIndex(n=>n<4);if(stage<0)return {stage:7,scores,results:[]};
 if(stage===0){const tokens=await crossSteps(snapshot),after=inspect(apply(structuredClone(snapshot),tokens,3));return {stage,scores,results:[{alg:tokens.map(t=>letterMap[t[0]]+t.slice(1)).join(' '),name:'完成底层十字',after,gain:after[0]-scores[0]}]}}
 const candidates=new Map(),add=(tokens,name)=>{const alg=tokens.join(' ');if(tokens.length&&tokens.length<=24&&!candidates.has(alg))candidates.set(alg,{tokens,name})};
 const moves=['R','L','U','D','F','B'].flatMap(f=>[f,f+"'",f+'2']);
 // Short positioning moves help with the first layer, which is not a fixed case set.
 if(stage<3){for(const a of moves){add([a],'色块调整');for(const b of moves){if(a[0]===b[0])continue;add([a,b],'色块调整');for(const c of moves){if(c[0]!==b[0])add([a,b,c],'色块调整')}}}}
 const basic=[...Array.from({length:5},(_,i)=>Array(i+1).fill("R U R' U'").join(' ')),"U R U' R' U' F' U F","U' L' U L U F U' F'","F R U R' U' F'","R U R' U R U2 R'","U R U' L' U R' U' L","R U' R U R U R U' R' U' R2"];
 const catalog=[...basic.map(alg=>({alg,name:'层先法常用公式'})),...data.filter(d=>['F2L','OLL','PLL','2LOLL','2LPLL','2AOLL','2APLL','4AOLL','4APLL'].includes(d.group)).flatMap(d=>d.algs.slice(0,2).map(alg=>({alg,name:d.group+' '+d.name})))];
 const ring='FRBL';for(const entry of catalog){let tokens;try{tokens=parseAlg(entry.alg)}catch{continue}if(tokens.some(t=>!/^[RLUDFB](?:2|'|2')?$/.test(t)))continue;for(let y=0;y<4;y++){const rotated=tokens.map(t=>ring.includes(t[0])?ring[(ring.indexOf(t[0])+y)%4]+t.slice(1):t);for(const setup of [[],['U'],["U'"],['U2']])add([...setup,...rotated],entry.name)}}
 const results=[];let checked=0;for(const {tokens,name}of candidates.values()){
  const trial=apply(structuredClone(snapshot),tokens,3),after=inspect(trial);
  if(after[stage]>scores[stage]&&after.slice(0,stage).every(n=>n===4))results.push({alg:tokens.join(' '),name,after,gain:after[stage]-scores[stage]});
  if(++checked%180===0)await new Promise(resolve=>setTimeout(resolve,0));
 }
 if(!results.length&&(stage===1||stage===2)){
  const pool=[],base=stage===1?Array.from({length:5},(_,i)=>Array(i+1).fill("R U R' U'").join(' ')):["U R U' R' U' F' U F","U' L' U L U F U' F'"];
  for(const alg of base)for(let y=0;y<4;y++)for(const setup of [[],['U'],["U'"],['U2']])pool.push([...setup,...parseAlg(alg).map(t=>ring.includes(t[0])?ring[(ring.indexOf(t[0])+y)%4]+t.slice(1):t)]);
  for(const first of pool){const intermediate=apply(structuredClone(snapshot),first,3);for(const second of pool){const tokens=[...first,...second],after=inspect(apply(structuredClone(intermediate),second,3));if(after[stage]>scores[stage]&&after.slice(0,stage).every(n=>n===4))results.push({alg:tokens.join(' '),name:'先取出，再放入正确槽位',after,gain:after[stage]-scores[stage]});if(++checked%180===0)await new Promise(r=>setTimeout(r,0))}}
 }
 results.sort((a,b)=>b.gain-a.gain||a.alg.split(' ').length-b.alg.split(' ').length);
 return {stage,scores,results:results.slice(0,1).map(r=>({...r,alg:r.alg.split(' ').map(t=>letterMap[t[0]]+t.slice(1)).join(' ')}))};
}
