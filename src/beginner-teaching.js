import {renderLesson,algorithms} from './tutorial-content.js';
import {apply,palette,faces} from './cube.js';
import {layerScores} from './layer-match.js';

export function cornerSetup(state){
 const setups=[[],['U'],["U'"],['U2']];
 for(const preparation of setups)if(layerScores(apply(structuredClone(state),preparation))[5]===4)return{complete:true,preparation};
 for(const up of setups){
  const aligned=apply(structuredClone(state),up);if(layerScores(aligned)[5]!==1)continue;
  for(const yaw of [[],['y'],['y2'],["y'"]]){
   const positioned=apply(structuredClone(aligned),yaw),centers=new Map(positioned.filter(s=>s.p.filter(v=>v!==0).length===1).map(s=>[s.n.join(','),s.c]));
   if(positioned.filter(s=>s.p.join(',')==='-1,1,1').every(s=>centers.get(s.n.join(','))===s.c))return{complete:false,preparation:[...up,...yaw]};
  }
 }
 return null;
}

export function yellowPattern(state){
 const color=state.find(s=>s.p.join(',')==='0,1,0').c;
 const edges=state.filter(s=>s.c===color&&s.n[1]===1&&Math.abs(s.p[0])+Math.abs(s.p[2])===1);
 if(edges.length===0)return'dot';if(edges.length===4)return'cross';
 if(edges.length!==2)throw Error('Top edge orientation is not a legal completed-stage state');
 return edges[0].p[0]===-edges[1].p[0]&&edges[0].p[2]===-edges[1].p[2]?'line':'L';
}
export function yellowCrossStep(state){
 const shape=yellowPattern(state);if(shape==='cross')return{shape,preparation:[]};
 const color=state.find(s=>s.p.join(',')==='0,1,0').c;
 const up=(s,x,z)=>s.some(t=>t.c===color&&t.n[1]===1&&t.p[0]===x&&t.p[2]===z);
 const preparation=shape==='dot'?[]:[[],['U'],["U'"],['U2']].find(tokens=>{const s=apply(structuredClone(state),tokens);return shape==='line'?up(s,-1,0)&&up(s,1,0):up(s,-1,0)&&up(s,0,-1)});
 if(!preparation)throw Error('Cannot orient the top pattern');
 return{shape,preparation};
}
export function addStageTeaching(container,stage,state,currentFormula){
 const section=renderLesson(container,stage,{compact:true});
 let name=null;
 const bottom=state.find(s=>s.p.join(',')==='0,-1,0').c,top=state.find(s=>s.p.join(',')==='0,1,0').c;
 if(stage===0)name=state.filter(s=>s.c===bottom&&s.n[1]===1&&Math.abs(s.p[0])+Math.abs(s.p[2])===1).length===4?'对齐，再送到底面':'先做白色小花';
 if(stage===1)name=state.some(s=>s.c===bottom&&s.p[1]===1&&Math.abs(s.p[0])+Math.abs(s.p[2])===2)?'白角在顶层':'白角在底层，但放错了';
 if(stage===2){const pieces=new Map();for(const s of state.filter(s=>s.p[1]===1&&Math.abs(s.p[0])+Math.abs(s.p[2])===1)){const key=s.p.join(',');if(!pieces.has(key))pieces.set(key,[]);pieces.get(key).push(s.c)}name=[...pieces.values()].some(colors=>!colors.includes(top))?(currentFormula===algorithms.left?'往左插':'往右插'):'中层放错／顶层找不到目标棱'}
 if(stage===3)name={dot:'点',L:'小拐角',line:'一字线'}[yellowPattern(state)];
 if(stage===4){const color=state.find(s=>s.p.join(',')==='0,1,0').c,count=state.filter(s=>s.c===color&&s.n[1]===1&&Math.abs(s.p[0])+Math.abs(s.p[2])===2).length;name=count===1?'只有一个黄角朝上':count===0?'没有黄角朝上':'两个黄角朝上'}
 if(stage===5){const setup=cornerSetup(state);name=setup?.complete?'四个角位置都正确':setup?'只有一个角位置正确':'暂时找不到这种摆法'}
 if(stage===6){const full=[[0,0,1],[1,0,0],[0,0,-1],[-1,0,0]].some(n=>{const tiles=state.filter(s=>s.n.join(',')===n.join(','));return tiles.every(t=>t.c===tiles.find(t=>t.p[1]===0&&Math.abs(t.p[0])+Math.abs(t.p[2])===1).c)});name=full?'有一个完整侧面':'没有完整侧面'}
 for(const card of section.querySelectorAll('.method-case'))if(card.querySelector('h3').textContent===name){card.classList.add('active');const badge=document.createElement('span');badge.className='current-shape';badge.textContent='你现在在这里';card.prepend(badge)}
 const active=section.querySelector('.method-case.active');if(active){const grid=section.querySelector('.method-cases'),other=document.createElement('details'),summary=document.createElement('summary');other.className='other-shapes';summary.textContent='其他形态怎么处理';other.append(summary);for(const card of [...grid.children])if(card!==active)other.append(card);grid.classList.remove('process-flow');grid.after(other)}
 const colors=[];for(const [normal,original]of faces)colors[original]=state.find(s=>s.p.filter(v=>v!==0).length===1&&s.n.join(',')===normal.join(',')).c;
 const colorPattern=new RegExp(palette.join('|'),'g');for(const figure of section.querySelectorAll('.method-diagram'))figure.innerHTML=figure.innerHTML.replace(colorPattern,color=>palette[colors[palette.indexOf(color)]]);
 const names=['黄','白','粉','橙','绿','蓝'],walker=document.createTreeWalker(section,NodeFilter.SHOW_TEXT);let text;
 while(text=walker.nextNode())text.nodeValue=text.nodeValue.replace(/[白黄]/g,color=>names[colors[color==='白'?1:0]]);
}
