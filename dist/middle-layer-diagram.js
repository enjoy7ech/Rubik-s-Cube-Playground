import {walkthrough} from './tutorial-walkthrough.js';
import {apply,parseAlg,palette} from './cube.js';

function flatView(state,after){
 const lookup=new Map(state.map(s=>[[...s.p,...s.n].join(','),s.c]));let cells='';
 const face=(name,ox,oy,normal,position)=>{let html=`<text x="${ox+32}" y="${oy-9}" text-anchor="middle" fill="#8c9a80" font-size="11">${name}</text>`;for(let row=0;row<3;row++)for(let col=0;col<3;col++){
  const p=position(row,col),color=palette[lookup.get([...p,...normal].join(','))],source=!after&&p.join(',')==='0,1,1',target=p.join(',')==='1,0,1';
  html+=`<rect x="${ox+col*22}" y="${oy+row*22}" width="20" height="20" rx="4" fill="${color}" stroke="${source?'#a77c88':target?'#79956a':'#d9dfd1'}" stroke-width="${source||target?2:1}" ${target&&!after?'stroke-dasharray="3 2"':''}/>`;
 }return html};
 cells+=face('顶面 U',32,25,[0,1,0],(r,c)=>[c-1,1,r-1]);cells+=face('前面 F',32,111,[0,0,1],(r,c)=>[c-1,1-r,1]);cells+=face('右面 R',128,111,[1,0,0],(r,c)=>[1,1-r,1-c]);
 return `<svg viewBox="0 0 224 212" role="img" aria-label="${after?'右插之后，绿粉棱位于前面和右面的中层，底排保持同色':'右插之前，绿粉棱在顶层前方，中层前右位置尚未拼好'}"><defs><marker id="${after?'middle-after':'middle-before'}" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0 0l6 3-6 3" fill="none" stroke="#849c6d" stroke-width="1.5"/></marker></defs>${cells}${after?'':`<path d="M68 102C108 77 121 114 89 138" fill="none" stroke="#849c6d" stroke-width="2" stroke-linecap="round" marker-end="url(#middle-before)"/>`}<path d="M32 182h158" stroke="#bdcdae" stroke-width="1.5" stroke-dasharray="4 3"/><text x="111" y="202" text-anchor="middle" fill="#92a27f" font-size="10">已拼好的第一层保持不变</text></svg>`;
}
export function addMiddleLayerDiagram(lesson){
 const initial=walkthrough[2].initial,after=apply(structuredClone(initial),parseAlg("U R U' R' U' F' U F"));
 const section=document.createElement('section');section.className='middle-explainer';section.setAttribute('aria-label','中层棱块公式的作用');
 section.innerHTML=`<div class="middle-purpose"><b>这个公式是做什么的？</b><p>把顶层的一条双色棱块，放进中层对应的位置。<br>做完整组后，已经拼好的第一层仍然保留。</p></div><div class="middle-diagram-pair"><figure>${flatView(initial,false)}<figcaption><b>① 放入前</b><span>本局的绿粉棱在顶层：<br>绿色已对齐前面的绿色中心。</span></figcaption></figure><figure>${flatView(after,true)}<figcaption><b>② 放入后</b><span>粉色属于右面，往右插。<br>绿粉棱来到绿、粉中心之间。</span></figcaption></figure></div><p class="middle-read-guide">图里的两片色块是<strong>同一条棱的两面</strong>。虚线框是它要去的位置。</p><div class="middle-direction"><span>另一色对右面中心 → <b>右插</b></span><span>另一色对左面中心 → <b>左插</b></span></div><p class="middle-read-guide">若该棱已经在中层却放错了，先用插入公式把它换到顶层，再放回正确位置。下面的连续演示会逐条处理本局剩下的中层棱。</p>`;
 lesson.append(section);
}
