import {lessons,renderLesson} from './tutorial-content.js';
import {pllDiagram,normalizePll} from './tutorial-diagrams.js';
import {walkthrough} from './tutorial-walkthrough.js';
import {whiteCrossSetup} from './white-cross-lesson.js';
import {addLessonDemo,pauseLessonDemo} from './lesson-demo.js';
import {advancedCourses,advancedSample,advancedDiagram} from './advanced-lessons.js';
import {$,$$,storage,toast} from './common.js';
const progress=storage.get('method-v3-progress',{});
let generation=0;
const dialog=$('#courseDialog');
dialog.querySelector('.close').innerHTML=$('#helpDialog .close').innerHTML;
dialog.addEventListener('close',()=>{generation++;pauseLessonDemo();document.documentElement.classList.remove('tutorial-dialog-open')});
const titles={beginner:'基础教程 · 七步还原',cfop:advancedCourses.cfop.title,roux:advancedCourses.roux.title,pll:'PLL · 21 种置换图鉴'};
async function showCourse(key){
 const version=++generation;
 pauseLessonDemo();$('#courseTitle').textContent=titles[key];
 const content=$('#courseContent');content.replaceChildren();
 if(!dialog.open)dialog.showModal();document.documentElement.classList.add('tutorial-dialog-open');dialog.querySelector('.course-dialog-body').scrollTop=0;
 if(key==='beginner'){
  const intro=document.createElement('p');intro.className='course-intro';intro.textContent='白色朝下，黄色朝上。每课围绕一条基础公式：它做什么 → 怎么摆 → 重复到什么时候。摆放图需要时再展开；每课下方的三维演示接着同一局样例，一直拼到完成。';content.append(intro);
  const index=document.createElement('nav');index.className='lesson-index';index.setAttribute('aria-label','七步学习目录');
  lessons.forEach((entry,i)=>{const link=document.createElement('a');link.href='#lesson-'+i;link.textContent=(i+1)+' '+entry.title;link.onclick=event=>{event.preventDefault();const target=document.querySelector('#lesson-'+i);target.open=true;target.scrollIntoView({block:'start',behavior:'smooth'})};index.append(link)});content.append(index);
  lessons.forEach((entry,i)=>{
   const lesson=document.createElement('details');lesson.className='lesson rewritten-lesson';lesson.id='lesson-'+i;lesson.open=i===0;
   const summary=document.createElement('summary');summary.textContent=String(i+1).padStart(2,'0')+' / '+entry.title;lesson.append(summary);
   renderLesson(lesson,i,{caseDemo:(card,example)=>addLessonDemo(card,example.alg,example.name,'case',0,example.sample())});addLessonDemo(lesson,walkthrough[i].alg,entry.title,'beginner',i);
   const game=document.createElement('a');game.className='outline button small';game.textContent='把本课样例带到游戏中';game.href='index.html?alg='+encodeURIComponent(walkthrough[i].alg)+'&setupAlg='+encodeURIComponent(whiteCrossSetup+' '+walkthrough.slice(0,i).map(c=>c.alg).join(' '))+'&case='+encodeURIComponent(entry.title);lesson.append(game);
   const label=document.createElement('label');label.className='lesson-complete';const check=document.createElement('input');check.type='checkbox';check.checked=!!progress[i];check.onchange=()=>{progress[i]=check.checked;storage.set('method-v3-progress',progress);if(check.checked)toast('这一课学会啦 ♡')};label.append(check,document.createTextNode('这一步我学会了'));lesson.append(label);content.append(lesson);
  });
 }else if(advancedCourses[key]){
  const course=advancedCourses[key],intro=document.createElement('p');intro.className='course-intro';intro.textContent=course.intro;content.append(intro);
  course.lessons.forEach((entry,i)=>{
   const lesson=document.createElement('details');lesson.className='lesson rewritten-lesson';lesson.open=i===0;
   const summary=document.createElement('summary');summary.textContent=String(i+1).padStart(2,'0')+' / '+entry.title;lesson.append(summary);
   const guide=document.createElement('div');guide.className='formula-guide';const purpose=document.createElement('p');purpose.className='formula-purpose';purpose.textContent=entry.purpose;const steps=document.createElement('ol');for(const text of entry.steps){const li=document.createElement('li');li.textContent=text;steps.append(li)}guide.append(purpose,steps);lesson.append(guide);
   const figure=document.createElement('div');figure.className='advanced-diagram';figure.innerHTML=advancedDiagram(entry);lesson.append(figure);
   const code=document.createElement('p');code.className='advanced-example-formula';code.textContent='本例动作：'+entry.alg;lesson.append(code);
   addLessonDemo(lesson,entry.alg,entry.title,'advanced',i,advancedSample(entry));
   const check=document.createElement('p');check.className='method-check';check.textContent='完成标志：'+entry.check;lesson.append(check);
   const practice=document.createElement('a');practice.className='outline button small';practice.textContent='在游戏中练习本例';practice.href='index.html?alg='+encodeURIComponent(entry.alg)+'&case='+encodeURIComponent(entry.title)+(entry.setup?'&setupAlg='+encodeURIComponent(entry.setup):'&setup=1');lesson.append(practice);
   if(entry.group){const library=document.createElement('a');library.className='outline button small';library.href='library.html?group='+encodeURIComponent(entry.group);library.textContent='查阅 '+entry.group+' 公式与局面 ↗';lesson.append(library)}
   content.append(lesson);
  });
  const sources=document.createElement('p');sources.className='tutorial-source';sources.append('继续学习：');for(const [title,url]of course.sources){const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener';link.textContent=title;sources.append(link,document.createTextNode('　'))}content.append(sources);
 }else{
  const intro=document.createElement('p');intro.className='course-intro';intro.textContent='先完成前两层和黄色顶面，再学 PLL。21 类图鉴只调整顶层位置；粉色箭头是角块，绿色箭头是棱块。每张卡都可演示，做完后可能还需要 U / U′ / U2 对齐。';content.append(intro);
  try{const data=await(await fetch('algs.json')).json();if(version!==generation)return;const grid=document.createElement('div');grid.className='pll-atlas';for(const entry of data.filter(d=>d.group==='PLL')){const example=normalizePll(entry.algs[0]);const card=document.createElement('article');card.className='pll-study-card';const title=document.createElement('h2');title.textContent=entry.name;const figure=document.createElement('div');figure.className='pll-diagram';figure.innerHTML=pllDiagram(example.state,'pll-'+entry.name.replace(/\W/g,''));const formula=document.createElement('p');formula.className='formula';formula.textContent=example.alg;card.append(title,figure,formula);addLessonDemo(card,example.alg,'PLL '+entry.name,'pll',0,example.state);grid.append(card)}content.append(grid)}catch{if(version!==generation)return;content.textContent='PLL 图鉴暂时无法读取，请刷新重试。'}
 }
 const note=document.createElement('p');note.className='tutorial-source';note.innerHTML='记号：R 右、U 顶、F 前；撇号是逆时针，2 是半圈。小写字母／w 是双层，M/E/S 是中层，x/y/z 是整体。顺逆时针从正对该面判断。'+(key==='beginner'?'<br>入门步骤参考 <a href="https://rubiks.com/solve-guide" target="_blank" rel="noopener">Rubik’s 官方指南</a>；图形由实际魔方状态绘制，公式与动画逐条校验。':'');content.append(note);
}
$$('[data-course]').forEach(button=>button.onclick=()=>showCourse(button.dataset.course));
