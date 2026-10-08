import fs from 'node:fs';
import {createCube,apply,parseAlg,move} from './dist/cube.js';
import {matchLayer,layerScores} from './dist/layer-match.js';
import {whiteCrossInitial,whiteCrossAlgorithm,whiteCrossNotes} from './dist/white-cross-lesson.js';
const data=JSON.parse(fs.readFileSync('dist/algs.json')),chapters=[],colors=['黄','白','粉','橙','绿','蓝'];let state=structuredClone(whiteCrossInitial);
const expected=new Map(createCube().map(s=>[s.n.join(','),s.c]));
const describeMove=t=>({R:'右面',L:'左面',U:'顶面',D:'底面',F:'前面',B:'后面'})[t[0]]+(t.includes('2')?'转半圈':t.includes("'")?'逆时针转':'顺时针转')+'（'+t+'）';
function add(alg,notes){const initial=structuredClone(state);apply(state,parseAlg(alg));chapters.push({initial,alg,notes,final:structuredClone(state)});console.log('Chapter',chapters.length,parseAlg(alg).length,'moves',layerScores(state));}
add(whiteCrossAlgorithm,whiteCrossNotes);
function targets(before,after,stage){const pieces=new Map();for(const s of after){if(stage===1?s.p[1]!==-1||s.p.filter(v=>v!==0).length!==3:s.p[1]!==0||s.p.filter(v=>v!==0).length!==2)continue;const key=s.p.join(',');if(!pieces.has(key))pieces.set(key,[]);pieces.get(key).push(s)}const names=[];for(const [key,piece]of pieces){if(!piece.every(s=>s.c===expected.get(s.n.join(','))))continue;if(before.filter(s=>s.p.join(',')===key).every(s=>s.c===expected.get(s.n.join(','))))continue;names.push(piece.map(s=>colors[s.c]).join('／')+(stage===1?'角块':'棱块'))}return names.join('、')}
for(const stage of [1,2,3]){
 let alg=[],notes=[stage===1?'承接刚才的白十字：四条白棱已对齐中心，现在逐个放好白色角块。':stage===2?'第一层已经完成。寻找不含黄色的棱块，把它们放到两种中心颜色之间。':'前两层已经完成。现在只处理黄色棱块的朝向，让它们围住黄色中心。'];
 for(let round=0;layerScores(state)[stage]<4&&round<12;round++){
  const match=await matchLayer(state,data);if(match.stage!==stage||!match.results.length)throw Error('Cannot continue stage '+stage);
  const tokens=parseAlg(match.results[0].alg),before=structuredClone(state),after=apply(structuredClone(state),tokens),target=stage<3?targets(before,after,stage):'黄色棱块';
  for(let i=0;i<tokens.length;i++){alg.push(tokens[i]);move(state,tokens[i]);notes.push(i===tokens.length-1?`这一组完成：${target}已归位，本阶段完成 ${layerScores(state)[stage]} / 4。`:`这组要处理 ${target}。第 ${i+1} / ${tokens.length} 转：${describeMove(tokens[i])}；保持中心方向，观察目标块如何移到对应位置。`)}
 }
 if(layerScores(state)[stage]!==4)throw Error('Incomplete stage');
 const initial=chapters.at(-1).final;chapters.push({initial:structuredClone(initial),alg:alg.join(' '),notes,final:structuredClone(state)});console.log('Chapter',chapters.length,alg.length,'moves',layerScores(state));
}
// Place top corners before orienting them, matching this layer-by-layer course.
let cornerAlg=[],cornerNotes=['承接黄色十字。暂不管黄角朝向，先让三个颜色属于对应的角落。'];
for(let round=0;layerScores(state)[5]<4&&round<5;round++){
 let best=null;for(const setup of [[],['U'],["U'"],['U2']])for(let y=0;y<4;y++)for(let repeat=1;repeat<=2;repeat++){
  const ring='FRBL',cycle=parseAlg("U R U' L' U R' U' L").map(t=>ring.includes(t[0])?ring[(ring.indexOf(t[0])+y)%4]+t.slice(1):t),tokens=[...setup,...Array.from({length:repeat},()=>cycle).flat()],after=apply(structuredClone(state),tokens),score=layerScores(after);
  if(score[5]>layerScores(state)[5]&&score.slice(0,4).every(n=>n===4)&&(!best||score[5]>best.score||score[5]===best.score&&tokens.length<best.tokens.length))best={tokens,score:score[5]};
 }
 if(!best)throw Error('Corner placement cannot advance');for(const t of best.tokens){cornerAlg.push(t);move(state,t);cornerNotes.push('角块换位：保持前两层和黄十字，按本组循环让角块回到正确角落。')}
 cornerNotes[cornerNotes.length-1]='这组换位完成，已有 '+layerScores(state)[5]+' / 4 个角块的位置正确。';
}
chapters.push({initial:structuredClone(chapters.at(-1).final),alg:cornerAlg.join(' '),notes:cornerNotes,final:structuredClone(state)});
const orientationInitial=structuredClone(state),orientation=[],orientationNotes=['四个角块的位置已正确。现在依次把右前上角的黄色转到顶面，只用 U 换下一个角。'];
for(let corner=0;corner<4;corner++){
 let count=0;const yellowUp=()=>state.some(s=>s.p.join(',')==='1,1,1'&&s.n.join(',')==='0,1,0'&&s.c===0);
 while(!yellowUp()&&count<6){for(const token of parseAlg("R' D' R D")){orientation.push(token);move(state,token);orientationNotes.push('正在转正第 '+(corner+1)+' 个角。下层暂时变化是正常的，请完整做完四步小循环。')}count++}
 if(!yellowUp())throw Error('Cannot orient corner');orientation.push('U');move(state,'U');orientationNotes.push(corner===3?'四个角已全部处理，U 已对齐；前两层恢复，黄色顶面完成。':'只转顶层 U，把下一个黄角送到右前上。不要改变整个魔方方向。');
}
if(!layerScores(state).slice(0,6).every(n=>n===4))throw Error('Orientation broke earlier layers');chapters.push({initial:orientationInitial,alg:orientation.join(' '),notes:orientationNotes,final:structuredClone(state)});
const lastInitial=structuredClone(state),last=[],lastNotes=['前两层、黄色顶面和角块位置都已完成。最后让顶层棱块侧色与中心对齐。'];
for(let round=0;layerScores(state)[6]<4&&round<5;round++){const match=await matchLayer(state,data);if(!match.results.length)throw Error('Last edges fail');for(const t of parseAlg(match.results[0].alg)){last.push(t);move(state,t);lastNotes.push('顶层棱块换位：按本组操作，让各条棱的侧色与对应中心匹配。')}}
lastNotes[lastNotes.length-1]='同一个打乱样例已经完整还原！检查六面都与各自中心同色。';chapters.push({initial:lastInitial,alg:last.join(' '),notes:lastNotes,final:structuredClone(state)});
if(!state.every(s=>s.c===expected.get(s.n.join(','))))throw Error('Walkthrough not solved');
for(let i=1;i<chapters.length;i++)if(JSON.stringify(chapters[i].initial)!==JSON.stringify(chapters[i-1].final))throw Error('Discontinuous chapters');
fs.writeFileSync('dist/tutorial-walkthrough.js','export const walkthrough='+JSON.stringify(chapters)+';\n');console.log('Verified 7 continuous chapters from one legal mixed cube to solved.');
