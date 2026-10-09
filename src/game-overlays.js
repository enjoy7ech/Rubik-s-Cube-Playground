import {toast} from './common.js';
const mobile=matchMedia('(max-width:760px)');
export function initGameOverlays(){
 const help=document.querySelector('#helpDialog .close').innerHTML;
 const course=document.createElement('dialog');course.id='courseDialog';course.setAttribute('aria-labelledby','courseTitle');
 course.innerHTML=`<div class="course-dialog-head"><div><span class="course-dialog-label">就转一下 · 随手翻翻教程</span><h2 id="courseTitle">怎么玩？</h2></div><div class="course-window-actions"><button class="outline small" data-course-home aria-label="返回教程目录">目录</button><button class="close" aria-label="关闭教程">${help}</button></div></div><div class="course-dialog-body"><section id="courseContent"></section></div>`;
 document.body.append(course);course.querySelector('.close').onclick=()=>course.close();
 let lessonModule;
 const home=()=>{lessonModule?.pauseCourse?.();document.querySelector('#courseTitle').textContent='选一条路线';document.querySelector('#courseContent').innerHTML=`<p class="course-intro">先打开基础教程，一步步拼好。看教程时，你的魔方仍留在原处。</p><div class="game-course-picker"><button data-course="beginner"><b>基础教程</b><span>固定公式 · 七步还原</span><i>↗</i></button><button data-course="cfop"><b>CFOP 进阶</b><span>角棱配对 · 顶层归位</span><i>↗</i></button><button data-course="roux"><b>Roux 进阶</b><span>左右造块 · 中层收尾</span><i>↗</i></button><button data-course="pll"><b>PLL 图鉴</b><span>21 种顶层位置交换</span><i>↗</i></button></div>`;course.querySelector('.course-dialog-body').scrollTop=0;};
 course.querySelector('[data-course-home]').onclick=home;
 course.querySelector('#courseContent').addEventListener('click',async event=>{const button=event.target.closest('[data-course]');if(!button)return;button.disabled=true;try{lessonModule??=await import('./lessons.js');if(course.open)await lessonModule.showCourse(button.dataset.course)}catch{toast('教程暂时无法读取，请重试。')}finally{button.disabled=false}});
 const courseState=()=>document.body.classList.toggle('mobile-tutorial-open',course.open);new MutationObserver(courseState).observe(course,{attributes:true,attributeFilter:['open']});
 for(const link of document.querySelectorAll('a[href="tutorials.html"], [data-open-tutorial]'))link.addEventListener('click',event=>{event.preventDefault();document.querySelector('#modeToolsDialog')?.close();document.querySelector('#handbookDialog')?.close();if(!course.querySelector('#courseContent').children.length)home();if(!course.open)course.show();courseState()});
 document.querySelector('[data-open-handbook]').addEventListener('click',()=>{course.close();document.querySelector('#modeToolsDialog')?.close()});
 course.addEventListener('close',()=>{lessonModule?.pauseCourse?.();courseState()});
 course.addEventListener('click',event=>{const link=event.target.closest('a[href]');if(link&&link.getAttribute('href').match(/^(index|library)\.html/)){event.preventDefault();window.open(link.href,'_blank','noopener')}});

 const popup=document.createElement('dialog');popup.id='modeToolsDialog';popup.setAttribute('aria-labelledby','modeToolsTitle');
 popup.innerHTML=`<div class="mode-tools-head"><h2 id="modeToolsTitle"></h2><button class="close" aria-label="关闭模式工具">${help}</button></div><div class="mode-tools-body"></div>`;document.body.append(popup);
 popup.querySelector('.close').onclick=()=>popup.close();
 const panels={timer:document.querySelector('.timer-panel'),formula:document.querySelector('.formula-panel')},homes={};
 for(const [mode,panel]of Object.entries(panels)){const marker=document.createComment(mode+' panel home');panel.before(marker);homes[mode]=marker}
 const reopen=document.createElement('button');reopen.className='outline mobile-mode-tools';reopen.hidden=true;document.querySelector('.stage-top').after(reopen);
 const host=popup.querySelector('.mode-tools-body');
 const restore=()=>{for(const [mode,panel]of Object.entries(panels))homes[mode].after(panel)};
 const show=()=>{const mode=document.body.dataset.mode;if(!mobile.matches||!panels[mode])return;restore();host.replaceChildren(panels[mode]);popup.querySelector('h2').textContent=mode==='timer'?'计时挑战':'公式练习';if(!popup.open)popup.show();host.scrollTop=0};
 const sync=(open=true)=>{const mode=document.body.dataset.mode||'free';reopen.hidden=!mobile.matches||mode==='free';reopen.textContent=mode==='timer'?'◷ 打开计时面板':'▧ 打开公式工具';if(!mobile.matches||mode==='free'){popup.close();restore()}else if(open)show()};
 let observedMode=document.body.dataset.mode;reopen.onclick=show;new MutationObserver(()=>{const mode=document.body.dataset.mode;if(mode!==observedMode){observedMode=mode;sync()}}).observe(document.body,{attributes:true,attributeFilter:['data-mode']});mobile.addEventListener('change',()=>sync(false));sync();
 document.querySelector('.mobile-mode-select')?.addEventListener('pointerdown',()=>popup.close());
 const records=document.createElement('details');records.className='mode-records';records.open=!mobile.matches;mobile.addEventListener('change',()=>records.open=!mobile.matches);const summary=document.createElement('summary');summary.textContent='查看计时记录';records.append(summary);for(const el of panels.timer.querySelectorAll('.history-head,.history'))records.append(el);panels.timer.append(records);
 panels.formula.querySelector('form').addEventListener('submit',()=>popup.close());panels.formula.querySelector('a[href="library.html"]').addEventListener('click',()=>popup.close());
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.querySelector('dialog:modal')){if(popup.open)popup.close();else if(course.open)course.close()}});
}
