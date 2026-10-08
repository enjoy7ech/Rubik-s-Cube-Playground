import {cfopCross} from './cfop-cross-example.js';
import {walkthrough} from './tutorial-walkthrough.js';
import {whiteCrossInitial,whiteCrossNotes} from './white-cross-lesson.js';
import {AlgorithmPlayer} from './algorithm-player.js';
import {createCube,parseAlg,inverse,apply,drawCube} from './cube.js';

let player=null,activeThumb=null;
const holder=document.createElement('div');holder.className='modal-player lesson-live-demo';holder.innerHTML='<canvas aria-label="教程步骤的三维魔方演示" role="img"></canvas><div class="modal-player-steps" data-steps></div><div class="modal-player-controls"><button class="outline small" data-reset>↺ 重播</button><button class="outline small" data-previous>← 上一步</button><button class="primary" data-play>播放</button><button class="outline small" data-next>下一步 →</button><span data-counter></span></div><p class="lesson-demo-note">这是本步骤的示例局面 · 拖动查看不同面，逐步观察色块移动</p>';
export function pauseLessonDemo(){player?.close()}
export function addLessonDemo(lesson,alg,title,course,index){
 const slot=document.createElement('div');slot.className='lesson-demo-slot';
 const thumb=document.createElement('button');thumb.className='lesson-demo-card';thumb.setAttribute('aria-label','演示 '+title);
 const isContinuous=course==='beginner',isWhiteCross=isContinuous&&index===0,chapter=isContinuous?walkthrough[index]:null,initial=chapter?structuredClone(chapter.initial):course==='cfop'&&index===0?structuredClone(cfopCross.initial):null;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=180;canvas.setAttribute('aria-hidden','true');drawCube(canvas,initial||apply(createCube(),inverse(parseAlg(alg))),3,-.55,.65);
 const text=document.createElement('span');text.innerHTML='<b>看看色块怎么移动</b><small>▶ 打开三维演示 · 支持逐步查看</small>';thumb.append(canvas,text);slot.append(thumb);lesson.append(slot);
 const notes=course==='beginner'?['示例：最后一条白棱已经对齐绿色中心，转前面半圈完成十字。','示例：白十字已完成，将最后一个白角插入对应槽位。','示例：第一层已完成，把顶层棱块插入右侧中层槽位。','示例：前两层已完成，只处理顶层棱块的黄色朝向。','示例：前两层和黄十字已完成，只调整顶层角块的位置。','示例：前两层、黄十字和角块位置已完成；完整转正两个黄角，过程中下层暂时打乱，最后恢复。','示例：前两层与黄色顶面已完成，最后交换三条顶层棱。']:['从这一局打乱直接拼底层十字，同时对齐白棱的侧色。','一对角棱的插入示例，前提是这一对已经摆到对应位置。','顶层角块定向的一个示例，前两层已完成。','顶层排列的一个示例，前两层与顶面朝向已完成。'];
 function show(autoplay){holder.querySelector('.lesson-demo-note').textContent=notes[index];if(activeThumb)activeThumb.hidden=false;pauseLessonDemo();slot.append(holder);thumb.hidden=true;activeThumb=thumb;player??=new AlgorithmPlayer(holder);player.stepDelay=isContinuous?1000:300;player.turnDuration=isContinuous?600:undefined;
 const originalUpdate=player.update.bind(player);if(!player.baseUpdate)player.baseUpdate=originalUpdate;
 let lastIndex=-1;
 let continueButton=holder.querySelector('[data-continue]');if(!continueButton){continueButton=document.createElement('button');continueButton.dataset.continue='';continueButton.className='primary lesson-continue';holder.append(continueButton)}
 continueButton.hidden=!isContinuous||index===6;continueButton.textContent='这一步完成，继续下一步 →';continueButton.onclick=()=>{const nextLesson=lesson.nextElementSibling;if(nextLesson?.matches('details.lesson')){nextLesson.open=true;nextLesson.querySelector('.lesson-demo-card').click();nextLesson.scrollIntoView({behavior:'smooth',block:'start'})}};
 player.update=()=>{player.baseUpdate();if(isContinuous){player.steps.replaceChildren();const chip=document.createElement('span');chip.className='current';const token=player.tokens[player.index];chip.textContent=token?('下一转：'+({R:'右面',L:'左面',U:'顶面',D:'底面',F:'前面',B:'后面'})[token[0]]+(token.includes('2')?'转半圈':token.includes("'")?'逆时针转':'顺时针转')):'本课完成';player.steps.append(chip);holder.querySelector('.lesson-demo-note').textContent=chapter.notes[player.index]||chapter.notes.at(-1);continueButton.disabled=player.index!==player.tokens.length;if(player.index!==lastIndex&&(player.index===player.tokens.length||lastIndex===player.tokens.length)){if(player.index===player.tokens.length&&index<2)player.scene.camera.position.set(4,-7,5);else player.scene.camera.position.set(5.2,4.2,6.5);player.scene.controls.update()}lastIndex=player.index}};
 player.load(alg,3,initial);if(autoplay&&!isContinuous)player.start()}
 thumb.onclick=()=>show(true);
 lesson.addEventListener('toggle',()=>{if(holder.parentElement!==slot)return;if(!lesson.open)pauseLessonDemo();else player?.load(alg,3,initial)});
 return ()=>show(false);
}
