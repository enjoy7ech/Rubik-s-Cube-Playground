import {apply,palette} from './cube.js';

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
const names={dot:'点形',L:'L 形',line:'一字形',cross:'十字'};
function topDiagram(shape,color=0){
 const yellow={dot:[4],L:[1,3,4],line:[3,4,5],cross:[1,3,4,5,7]}[shape];
 return `<svg viewBox="0 0 100 120" role="img" aria-label="${names[shape]}顶面示意，前面在图的下方">${Array.from({length:9},(_,i)=>`<rect x="${9+i%3*28}" y="${8+Math.floor(i/3)*28}" width="25" height="25" rx="5" fill="${yellow.includes(i)?palette[color]:'#e4e8dd'}"/>`).join('')}<text x="50" y="111" text-anchor="middle" fill="#7c8e6e" font-size="11">↓ 前面 F</text></svg>`;
}
export function addYellowCrossTeaching(container,state,showFormula=true){
 const color=state?state.find(s=>s.p.join(',')==='0,1,0').c:0,bottom=state?state.find(s=>s.p.join(',')==='0,-1,0').c:1,colorNames=['黄','白','粉','橙','绿','蓝'],topName=colorNames[color];
 const active=state?yellowPattern(state):null,section=document.createElement('section');section.className='fixed-method-teaching';
 const title=document.createElement('h3');title.textContent='只看'+topName+'色棱，角块先忽略';section.append(title);
 const intro=document.createElement('p');intro.textContent=topName+'色在上、'+colorNames[bottom]+'色在下。每次做完整条公式，再观察形状、重新摆方向。图中灰色表示这一步不用管。';section.append(intro);
 if(showFormula){const code=document.createElement('p');code.className='formula';code.textContent="F R U R' U' F'";section.append(code)}
 const cards=document.createElement('div');cards.className='pattern-cards';
 for(const [shape,position,outcome] of [['dot','方向任意','做一次 → L 形'],['L','把两条黄棱摆在左、上','做一次 → 一字形'],['line','把黄色直线横着摆','做一次 → 十字']]){
  const card=document.createElement('article');card.className='pattern-card'+(active===shape?' active':'');card.innerHTML=topDiagram(shape,color);
  const heading=document.createElement('b');heading.textContent=names[shape]+(active===shape?' · 你现在在这里':'');const prep=document.createElement('p');prep.textContent=position.replaceAll('黄',topName);const next=document.createElement('span');next.textContent=outcome;card.append(heading,prep,next);cards.append(card);
 }section.append(cards);const check=document.createElement('p');check.className='method-check';check.textContent='完成标志：四条顶色棱都朝上。侧色和顶层角块不用同时拼好，底面十字与前两层保留。';section.append(check);container.append(section);
}
const instructions=[
 ['找底色棱块','把它们搬到顶面，围住顶面中心做小花。','只转顶层对齐侧色，再把对应侧面转半圈送到底面。','四条底色棱和侧色全部对齐后，才开始拼角。'],
 ['找含底面颜色的角块，用另外两色找到对应槽位。','把目标槽放在右前下，角块摆到它正上方。','重复同一小循环，直到角块入槽；做完整组再观察。','若角在底层却错位，先用同一公式取出，再摆到正确槽上方。'],
 ['在顶层找不含顶面颜色的棱块。','对齐它的侧色，准备把它放进右前中层槽。','用同一右插公式；不符合方向或已在中层错位时，先用这条公式取出并调整。','做完一轮再检查，重复处理其余棱块，第一层保持完成。'],
 [],
 ['看角块的三种颜色是否属于它所在的三个中心，不要求顶色朝上。','若有一个角位置正确，把它放在右前上；没有正确角，先做一轮。','重复同一换角公式，做完再数位置正确的角。','四个角位置都正确后，再处理朝向。'],
 ['把一个顶色没朝上的角放在右前上。','重复同一小循环，直到这个角的顶色朝上。','只转顶层，把下一个角送到右前上，再重复。','中途下层变乱是正常的。保持整个魔方方向不变，处理完四角并对齐顶层，下层才恢复。'],
 ['找侧色已对齐的顶层棱，把它放在后面；若没有，先做一轮。','重复同一换棱公式，观察剩下三条棱的位置。','方向不对就再做一次，不换另一条公式。','四条棱都对齐中心后，六面还原完成。']
];
export function addStageTeaching(container,stage,state){
 if(stage===3)return addYellowCrossTeaching(container,state,false);
 const section=document.createElement('section');section.className='fixed-method-teaching';const title=document.createElement('h3');title.textContent='观察 → 摆放 → 做公式 → 再观察';section.append(title);
 const list=document.createElement('ol');for(const instruction of instructions[stage]){const item=document.createElement('li');item.textContent=instruction;list.append(item)}section.append(list);container.append(section);
}
