import {AlgorithmPlayer} from './algorithm-player.js';
import {walkthrough} from './tutorial-walkthrough.js';
import {sampleFor} from './tutorial-diagrams.js';
import {drawCube} from './cube.js';
let player=null,activeThumb=null;
const holder=document.createElement('div');holder.className='modal-player lesson-live-demo';
holder.innerHTML='<canvas aria-label="教程的三维演示" role="img"></canvas><div class="modal-player-steps" data-steps></div><div class="modal-player-controls"><button class="outline small" data-reset>↺ 重播</button><button class="outline small" data-previous>← 上一步</button><button class="primary" data-play>播放</button><button class="outline small" data-next>下一步 →</button><span data-counter></span></div><p class="lesson-demo-note"></p>';
export function pauseLessonDemo(){player?.close();if(activeThumb)activeThumb.hidden=false;holder.remove();activeThumb=null}
const describe=t=>{const face=t.match(/[A-Za-z]/)[0],names={R:'右面',L:'左面',U:'顶面',D:'底面',F:'前面',B:'后面',M:'左右之间的中层',E:'上下之间的中层',S:'前后之间的中层',x:'整块沿右面方向',y:'整块沿顶面方向',z:'整块沿前面方向'},wide=t.includes('w')||'rludfb'.includes(face);return(names[face]||names[face.toUpperCase()])+(wide?'两层一起':'')+(t.includes('2')?'转半圈':t.includes("'")?'逆时针转':'顺时针转')+'（'+t+'）'};
export function addLessonDemo(lesson,alg,title,course,index,customInitial=null){
 const chapter=course==='beginner'?walkthrough[index]:null,initial=chapter?.initial||customInitial||sampleFor(alg),slot=document.createElement('div');slot.className='lesson-demo-slot';
 const thumb=document.createElement('button');thumb.className='lesson-demo-card';thumb.setAttribute('aria-label','演示 '+title);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=180;canvas.setAttribute('aria-hidden','true');drawCube(canvas,initial,3,-.55,.65);
 const text=document.createElement('span'),b=document.createElement('b'),hint=document.createElement('small');b.textContent=chapter?'跟着同一局样例做这一课':course==='advanced'?'演示这一步的练习样例':'三维演示这个形态';hint.textContent='▶ 点击打开 · 一步一步看';text.append(b,hint);thumb.append(canvas,text);slot.append(thumb);lesson.append(slot);
 thumb.onclick=()=>{
  pauseLessonDemo();activeThumb=thumb;thumb.hidden=true;slot.append(holder);player??=new AlgorithmPlayer(holder);player.stepDelay=800;player.turnDuration=550;
  player.baseLessonUpdate??=player.update.bind(player);
  player.update=()=>{player.baseLessonUpdate();const token=player.tokens[player.index];player.steps.replaceChildren();const chip=document.createElement('span');chip.className='current';chip.textContent=token?'下一转：'+describe(token):'这一轮做完，再观察';player.steps.append(chip);holder.querySelector('.lesson-demo-note').textContent=chapter?(chapter.notes[player.index]||chapter.notes.at(-1)):course==='advanced'?'这是本课的独立样例。可以暂停、重播或拖动，观察这一步怎样完成。':'按图摆好方向，完整做公式。可以暂停、重播或拖动看侧面。'};
  player.load(alg,3,initial);
 };
 const owner=lesson.closest('details');owner?.addEventListener('toggle',()=>{if(!owner.open&&holder.parentElement===slot)pauseLessonDemo()});
}
