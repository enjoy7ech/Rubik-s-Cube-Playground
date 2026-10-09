import {createCube,apply,parseAlg,inverse,palette} from './cube.js';
import {whiteCrossInitial,whiteCrossMoves} from './white-cross-lesson.js';
import {layerScores} from './layer-match.js';
export const sampleFor=alg=>apply(createCube(),inverse(parseAlg(alg)));
const faces=[['U',[0,1,0],(r,c)=>[c-1,1,r-1]],['F',[0,0,1],(r,c)=>[c-1,1-r,1]],['R',[1,0,0],(r,c)=>[1,1-r,1-c]],['B',[0,0,-1],(r,c)=>[1-c,1-r,-1]],['L',[-1,0,0],(r,c)=>[-1,1-r,c-1]],['D',[0,-1,0],(r,c)=>[c-1,-1,1-r]]];
export function faceGrid(state,name,x=10,y=10,size=22,focus=()=>true){
 const [,normal,position]=faces.find(f=>f[0]===name),lookup=new Map(state.map(s=>[[...s.p,...s.n].join(','),s.c]));
 return Array.from({length:9},(_,i)=>{const p=position(Math.floor(i/3),i%3),color=lookup.get([...p,...normal].join(','));return `<rect x="${x+i%3*size}" y="${y+Math.floor(i/3)*size}" width="${size-2}" height="${size-2}" rx="4" fill="${focus(p,normal,color)?palette[color]:'#e5e9df'}" stroke="#cbd5bf" stroke-width="1"/>`}).join('');
}
export function topView(state,{ignoreCorners=false,sideHints=false,focusColor=0}={}){
 const side=sideHints?['B','R','F','L'].map((name,i)=>{const [,normal,position]=faces.find(f=>f[0]===name);return Array.from({length:3},(_,c)=>{const p=position(0,c),tile=state.find(s=>s.p.join(',')===p.join(',')&&s.n.join(',')===normal.join(','));const color=tile.c===0?palette[0]:'#e5e9df',index=i<2?2-c:c,locations=[[28+index*22,9],[99,28+index*22],[28+index*22,99],[9,28+index*22]];return `<rect x="${locations[i][0]}" y="${locations[i][1]}" width="${i%2?10:20}" height="${i%2?20:10}" rx="3" fill="${color}"/>`}).join('')}).join(''):'';
 return `<svg viewBox="0 0 125 145" role="img" aria-label="顶面图，前面F在下方">${faceGrid(state,'U',28,28,22,(p,n,color)=>Math.abs(p[0])+Math.abs(p[2])===0||color===focusColor&&(!ignoreCorners||Math.abs(p[0])+Math.abs(p[2])<2))}${side}<text x="61" y="135" text-anchor="middle" font-size="11" fill="#7e8e70">↓ 前面 F</text></svg>`;
}
export function stripView(state,highlight=''){
 return `<svg viewBox="0 0 310 112" role="img" aria-label="四个侧面的顶排颜色">${['L','F','R','B'].map((name,i)=>{const [,n,position]=faces.find(f=>f[0]===name);return `<text x="${40+i*77}" y="18" text-anchor="middle" font-size="11" fill="#7e8e70">${{L:'左 L',F:'前 F',R:'右 R',B:'后 B'}[name]}</text>`+Array.from({length:3},(_,c)=>{const p=position(0,c),tile=state.find(s=>s.p.join(',')===p.join(',')&&s.n.join(',')===n.join(','));return `<rect x="${8+i*77+c*22}" y="30" width="20" height="24" rx="4" fill="${palette[tile.c]}" stroke="${highlight===name?'#819b69':'none'}" stroke-width="2"/>`}).join('')+(highlight===name?`<path d="M${8+i*77} 65h64" stroke="#819b69" stroke-width="2"/><text x="${40+i*77}" y="88" text-anchor="middle" font-size="10" fill="#819b69">${name==='L'?'眼睛在左':'完整面在后'}</text>`:'')}).join('')}</svg>`;
}
export function crossBottom(state){return `<svg viewBox="0 0 190 120" role="img" aria-label="底面和前面示意">${faceGrid(state,'D',12,20,23)}${faceGrid(state,'F',106,20,23)}<text x="44" y="106" text-anchor="middle" font-size="11" fill="#7e8e70">底面 D</text><text x="138" y="106" text-anchor="middle" font-size="11" fill="#7e8e70">前面 F</text></svg>`}
export function pllDiagram(state,id){
 const topColor=state.find(s=>s.p.join(',')==='0,1,0').c,centers=new Map(state.filter(s=>s.p.filter(v=>v!==0).length===1).map(s=>[s.c,s.n]));let arrows='';
 const pieces=new Map();for(const s of state.filter(s=>s.p[1]===1&&Math.abs(s.p[0])+Math.abs(s.p[2])>0)){const k=s.p.join(',');if(!pieces.has(k))pieces.set(k,[]);pieces.get(k).push(s)}
 for(const piece of pieces.values()){const p=piece[0].p,destination=piece.filter(s=>s.c!==topColor).reduce((v,s)=>{const n=centers.get(s.c);return[v[0]+n[0],v[1]+n[2]]},[0,0]);if(p[0]===destination[0]&&p[2]===destination[1])continue;arrows+=`<line x1="${60+p[0]*27}" y1="${60+p[2]*27}" x2="${60+destination[0]*27}" y2="${60+destination[1]*27}" stroke="${piece.length===3?'#c78e9e':'#749b85'}" stroke-width="2" marker-end="url(#${id})"/>`}
 return `<svg viewBox="0 0 120 140" role="img" aria-label="顶层置换方向，粉色箭头是角块，绿色是棱块"><defs><marker id="${id}" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0 0l5 2.5-5 2.5" fill="none" stroke="#7a8c70"/></marker></defs>${faceGrid(state,'U',22,22,27)}${arrows}<text x="60" y="128" text-anchor="middle" font-size="11" fill="#7e8e70">↓ 前面 F</text></svg>`;
}
export const daisyExample=()=>apply(structuredClone(whiteCrossInitial),whiteCrossMoves.slice(0,4));
export const whiteCrossFinalExample=()=>apply(structuredClone(whiteCrossInitial),whiteCrossMoves);
export function insertionDiagram(alg,left=false){
 const state=sampleFor(alg),side=left?'L':'R';
 return `<svg viewBox="0 0 220 192" role="img" aria-label="顶层棱放入${left?'左':'右'}侧中层槽的示意">${faceGrid(state,'U',24,18,23)}${faceGrid(state,'F',24,106,23)}${faceGrid(state,side,124,106,23)}<text x="58" y="12" text-anchor="middle" font-size="10" fill="#7e8e70">顶 U</text><text x="58" y="185" text-anchor="middle" font-size="10" fill="#7e8e70">前 F</text><text x="158" y="185" text-anchor="middle" font-size="10" fill="#7e8e70">${left?'左 L':'右 R'}</text><path d="M58 88Q115 72 ${left?'34':'82'} 140" fill="none" stroke="#8ba776" stroke-width="2"/><circle cx="${left?'34':'82'}" cy="140" r="6" fill="none" stroke="#8ba776" stroke-width="2"/></svg>`;
}
const conversionCache=new Map();
export function fishConversionExample(count,fish1,fish2){
 if(conversionCache.has(count))return structuredClone(conversionCache.get(count));
 const key=s=>s.filter(t=>t.c===0&&t.p[1]===1&&Math.abs(t.p[0])+Math.abs(t.p[2])===2).map(t=>[...t.p,...t.n].join(',')).sort().join(';');
 const queue=[createCube()],seen=new Set([key(queue[0])]);
 for(let i=0;i<queue.length;i++){
  const state=queue[i],up=state.filter(t=>t.c===0&&t.n[1]===1&&Math.abs(t.p[0])+Math.abs(t.p[2])===2).length,normal=count===0?'-1,0,0':'0,0,1';
  if(up===count&&state.some(t=>t.c===0&&t.p.join(',')==='-1,1,1'&&t.n.join(',')===normal)){conversionCache.set(count,state);return structuredClone(state)}
  for(const alg of ['U',fish1,fish2]){const next=apply(structuredClone(state),parseAlg(alg)),hash=key(next);if(!seen.has(hash)){seen.add(hash);queue.push(next)}}
 }
 throw Error('Cannot create a fish conversion example');
}
export function normalizePll(alg){
 const tokens=parseAlg(alg),initial=sampleFor(alg);let best=null;
 const simplify=tokens=>{const result=[];for(const token of tokens){const base=token.replace(/(?:2'?|')$/,''),previous=result.at(-1),priorBase=previous?.replace(/(?:2'?|')$/,'');if(priorBase!==base){result.push(token);continue}result.pop();const turns=t=>/2'?$/.test(t)?2:t.endsWith("'")?3:1,n=(turns(previous)+turns(token))%4;if(n)result.push(base+(n===1?'':n===2?'2':"'"))}return result};
 for(const setup of [[],['U'],["U'"],['U2']]){const state=apply(structuredClone(initial),setup),scores=layerScores(state),stationary=scores[5]+scores[6],moves=simplify([...inverse(setup),...tokens]);if(!best||stationary>best.stationary||stationary===best.stationary&&moves.length<best.moves.length)best={state,stationary,moves}}
 return{state:best.state,alg:best.moves.join(' ')};
}
