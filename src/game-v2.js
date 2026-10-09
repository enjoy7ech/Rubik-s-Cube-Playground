import {initCurrentCase} from './current-case.js';
import {initStageBackground} from './stage-background.js';
import {CubeScene} from './cube-scene.js';
import {createCube,parseAlg,inverse,move,movePlan,apply,drawCube} from './cube.js';
import {$,$$,storage,toast} from './common.js';
const canvas=$('#cube');
const cubeScene=new CubeScene(canvas);
let size=3,state=createCube(),history=[],baseline=0,yaw=-.55,pitch=.5;
let sequence=[],seqIndex=0,playing=false,playTimeout=null,initialPractice=null;
let currentMode='free',hasScrambled=false,timerStartedForRound=false;
let animation=null,turnQueue=[],processing=false,generation=0;
let scrambling=false,scrambleIndex=0,scrambleTotal=0;
let times=storage.get('times',[]),running=false,start=0,timerFrameId;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function solved(){const colors=new Map();for(const s of state){const face=s.n.join(',');if(colors.has(face)&&colors.get(face)!==s.c)return false;colors.set(face,s.c)}return true}
function draw(){cubeScene.update(state,size,animation)}
function resize(){cubeScene.resize();draw()}
new ResizeObserver(resize).observe(canvas);
function syncGame(){const done=solved();$('#turnCount').textContent=Math.max(0,history.length-baseline);$('#gameStatus').textContent=scrambling?'正在打乱 · '+scrambleIndex+' / '+scrambleTotal:done?'已还原 · 打乱开始一局新游戏':sequence.length?'公式练习 · 一步一步观察':'进行中 · 试着把每一面转成同一种颜色';if(!scrambling&&hasScrambled&&done){hasScrambled=false;if(running)stopTimer();toast('还原成功！这一局是你的啦 ✦');celebrate()}}
function setScrambling(value){scrambling=value;canvas.setAttribute('aria-busy',String(value));$$('#moves button, #scramble, #undo, #timer, #timerStart, #algForm button, #algInput, #pause, #practiceReset').forEach(b=>b.disabled=value);$('#scramble').textContent=value?'⤨ 正在打乱…':'⤨ 打乱 · 开始新一局';updateSequence()}
function pause(){playing=false;clearTimeout(playTimeout);updateSequence()}
function cancelTurns(){cubeScene.cancelLayerDrag?.();generation++;turnQueue=[];processing=false;animation=null;canvas.dataset.animating='false';$('#moveName').textContent='';setScrambling(false);pause()}
function clearSequence(){pause();sequence=[];seqIndex=0;initialPractice=null;updateSequence()}
function animateTurn(token,version,speed,fromAngle=0){const plan=movePlan(token,size),duration=reducedMotion?40:speed??(plan.turns===2?430:300);const begin=performance.now();let frames=0;canvas.dataset.animating='true';canvas.dataset.move=token;$('#moveName').textContent=token;return new Promise(resolve=>{function frame(now){if(version!==generation){resolve(false);return}const t=Math.min(1,(now-begin)/duration),eased=fromAngle!==0?t*t*(3-2*t):t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;animation={...plan,angle:fromAngle+(plan.dir*plan.turns*Math.PI/2-fromAngle)*eased};frames++;canvas.dataset.animationFrames=String(frames);draw();if(t<1){requestAnimationFrame(frame)}else{animation=null;move(state,token,size);canvas.dataset.animating='false';$('#moveName').textContent='';draw();resolve(true)}}requestAnimationFrame(frame)})}
function queueTurn(token,onComplete=()=>{},speed,fromAngle=0){try{movePlan(token,size)}catch(e){toast(e.message);return}turnQueue.push({token,onComplete,speed,fromAngle});pump()}
async function pump(){if(processing)return;processing=true;const version=generation;while(turnQueue.length){const job=turnQueue.shift(),completed=await animateTurn(job.token,version,job.speed,job.fromAngle);if(!completed)return;job.onComplete();syncGame();updateSequence()}processing=false;updateSequence()}
function manualTurn(token,fromAngle=0,speed){if(scrambling)return;if(sequence.length)clearSequence();if(currentMode==='timer'&&hasScrambled&&!running&&!timerStartedForRound)startTimer();queueTurn(token,()=>history.push(token),speed,fromAngle)}
function updateSequence(){$('#stepLabel').textContent=sequence.length?seqIndex+' / '+sequence.length+(seqIndex?' · '+sequence[seqIndex-1]:''):'输入公式后开始练习';$('#stepBack').disabled=seqIndex===0||processing||scrambling;$('#stepNext').disabled=seqIndex>=sequence.length||processing||scrambling;$('#pause').textContent=playing?'暂停':'继续'}
function nextStep(){if(processing||seqIndex>=sequence.length){if(seqIndex>=sequence.length)pause();return}queueTurn(sequence[seqIndex],()=>{history.push(sequence[seqIndex]);seqIndex++;if(seqIndex>=sequence.length){pause();toast('公式转完啦 ♡')}else if(playing)playTimeout=setTimeout(nextStep,reducedMotion?60:180)})}
function startSequence(){if(!sequence.length)return;if(seqIndex>=sequence.length){toast('点击“从头练习”，再看一遍');return}playing=true;updateSequence();nextStep()}
function setMode(mode){currentMode=mode;document.body.dataset.mode=mode;$$('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode))}
$$('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));setMode('free');
cubeScene.enableLayerDrag({canTurn:()=>!processing&&!scrambling&&!playing,onPreview:(token,angle)=>{animation={...movePlan(token,size),angle};canvas.dataset.dragMove=token;draw()},onTurn:(token,angle)=>{canvas.dataset.dragMove='';manualTurn(token,angle,Math.round(340+240*(1-Math.min(1,Math.abs(angle)/(Math.PI/2)))))},onCancel:()=>{animation=null;canvas.dataset.dragMove='';draw()}});
['R','U','F','L','D','B'].forEach(f=>[f,f+"'"].forEach(token=>{const b=document.createElement('button');b.textContent=token;b.title=token;b.setAttribute('aria-label','转动 '+token);b.onclick=()=>manualTurn(token);$('#moves').append(b)}));
$('#reset').onclick=()=>{cancelTurns();clearSequence();if(running)stopTimer(false);state=createCube(size);history=[];baseline=0;hasScrambled=false;timerStartedForRound=false;$('#scrambleText').textContent='准备好了，就转第一下吧。';draw();syncGame()};
$('#puzzle').onchange=()=>{size=Number($('#puzzle').value);$('#reset').click()};
$('#scramble').onclick=()=>{if(scrambling)return;cancelTurns();clearSequence();if(running)stopTimer(false);history=[];baseline=0;hasScrambled=false;timerStartedForRound=false;const tokens=[],faces=['R','U','F','L','D','B'];let last='';for(let i=0;i<(size===2?11:size===3?20:35);i++){let f;do{f=faces[Math.floor(Math.random()*faces.length)]}while(f===last);last=f;const wide=size>3&&Math.random()<.25?'w':'';tokens.push(f+wide+['',"'",'2'][Math.floor(Math.random()*3)])}scrambleIndex=0;scrambleTotal=tokens.length;setScrambling(true);$('#scrambleText').textContent=tokens.join(' ');$('#timer').textContent='00.00';$('#timerStart').textContent='开始计时';draw();syncGame();tokens.forEach((token,i)=>queueTurn(token,()=>{history.push(token);baseline=history.length;scrambleIndex=i+1;if(scrambleIndex===scrambleTotal){setScrambling(false);hasScrambled=true;toast(currentMode==='timer'?'打乱完成，开始转动或按空格计时':'打乱完成，新的一局准备好啦！')}},movePlan(token,size).turns===2?165:110))};
$('#undo').onclick=()=>{if(processing)return;pause();if(sequence.length&&seqIndex>0){const token=sequence[seqIndex-1];queueTurn(inverse([token])[0],()=>{seqIndex--;history.pop()})}else if(history.length>baseline){const token=history.at(-1);queueTurn(inverse([token])[0],()=>history.pop())}else toast('还没有可以撤回的转动')};
$('#stepNext').onclick=()=>{pause();nextStep()};$('#stepBack').onclick=()=>$('#undo').click();$('#pause').onclick=()=>playing?pause():startSequence();
$('#algForm').onsubmit=e=>{e.preventDefault();setMode('formula');try{const tokens=parseAlg($('#algInput').value);if(!tokens.length)return toast('先输入一个公式吧');tokens.forEach(t=>movePlan(t,size));if(tokens.join(' ')!==sequence.join(' ')||!sequence.length){cancelTurns();sequence=tokens;seqIndex=0;initialPractice={state:structuredClone(state),tokens:[...tokens]}}startSequence()}catch(err){toast(err.message)}};
$('#practiceReset').onclick=()=>{try{cancelTurns();const tokens=initialPractice?.tokens||parseAlg($('#algInput').value);if(!tokens.length)return toast('先选一个公式吧');state=initialPractice?structuredClone(initialPractice.state):apply(createCube(size),inverse(tokens),size);initialPractice={state:structuredClone(state),tokens:[...tokens]};sequence=[...tokens];seqIndex=0;history=[];baseline=0;hasScrambled=false;draw();syncGame();updateSequence()}catch(e){toast(e.message)}};
function format(t){return(t/1000).toFixed(2)}
function clockFrame(){if(running){$('#timer').textContent=format(performance.now()-start);timerFrameId=requestAnimationFrame(clockFrame)}}
function startTimer(){running=true;timerStartedForRound=true;start=performance.now();$('#timerStart').textContent='停止计时';clockFrame()}
function stopTimer(save=true){if(!running)return;const elapsed=performance.now()-start;running=false;cancelAnimationFrame(timerFrameId);if(save){times.push(elapsed);storage.set('times',times);$('#timer').textContent=format(elapsed)}else $('#timer').textContent='00.00';$('#timerStart').textContent='再来一次';renderTimes()}
function toggleTimer(){if(scrambling)return;running?stopTimer():startTimer()}
function renderTimes(){$('#attempts').textContent=times.length;$('#best').textContent=times.length?format(Math.min(...times))+' s':'—';const last=times.slice(-5).sort((a,b)=>a-b);$('#ao5').textContent=last.length===5?format(last.slice(1,-1).reduce((s,v)=>s+v,0)/3)+' s':'—';$('#history').innerHTML=times.length?times.slice(-20).reverse().map((t,i)=>`<div><span># ${times.length-i}</span><span>${format(t)} s</span></div>`).join(''):'还没有记录，开始第一局挑战吧。'}
$('#timer').onclick=$('#timerStart').onclick=toggleTimer;$('#clearTimes').onclick=()=>{times=[];storage.set('times',times);renderTimes();toast('记录已清空')};
document.addEventListener('keydown',e=>{if(e.repeat||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)||$$('dialog[open]:not(#handbookDialog):not(#currentCaseDialog)').length)return;const f=e.key.toUpperCase();if(['R','U','F','L','D','B'].includes(f)){e.preventDefault();manualTurn(f+(e.shiftKey?"'":''))}else if(e.code==='Space'){e.preventDefault();setMode('timer');toggleTimer()}else if(e.key==='/'){e.preventDefault();openHandbook()}});
function celebrate(){if(reducedMotion)return;const colors=['#e9b0bb','#b0d1a0','#f0d58d','#b6c9e3'];for(let i=0;i<24;i++){const p=document.createElement('i');p.className='win-paper';p.style.setProperty('--x',(Math.random()*90+5)+'%');p.style.setProperty('--drift',(Math.random()*140-70)+'px');p.style.background=colors[i%colors.length];p.style.animationDelay=(Math.random()*.25)+'s';$('.game-stage').append(p);setTimeout(()=>p.remove(),1800)}}
const params=new URLSearchParams(location.search),incoming=params.get('alg');if(incoming){try{size=3;$('#puzzle').value=String(size);const tokens=parseAlg(incoming);state=createCube(size);if(params.get('setupAlg'))apply(state,parseAlg(params.get('setupAlg')),3);else if(params.get('setup')==='1')apply(state,inverse(tokens),size);sequence=tokens;initialPractice={state:structuredClone(state),tokens:[...tokens]};$('#algInput').value=incoming;$('#practiceTitle').textContent=params.get('case')||'公式练习';setMode('formula')}catch(e){toast(e.message)}}
renderTimes();updateSequence();syncGame();resize();

const handbook=$('#handbookDialog'),handbookFrame=$('#handbookFrame');
function openHandbook(favorites=false){handbookMinimized=false;restoreHandbook.hidden=true;if(!handbookFrame.hasAttribute('src'))handbookFrame.src='library.html?handbook=1'+(favorites?'&favorites=1':'');else if(favorites)handbookFrame.contentWindow?.postMessage({type:'handbook-favorites'},location.origin);if(!handbook.open)handbook.show()}
$$('a[href^="library.html"]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();openHandbook(link.getAttribute('href').includes('favorites'))}));
handbook.addEventListener('close',()=>{restoreHandbook.hidden=!handbookMinimized;handbookFrame.contentWindow?.postMessage({type:'handbook-close'},location.origin)});
window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===handbookFrame.contentWindow&&event.data?.type==='handbook-dismiss')handbook.close()});

let handbookMinimized=false;const restoreHandbook=$('#restoreHandbook');
$('#minimizeHandbook').onclick=()=>{handbookMinimized=true;handbook.close()};restoreHandbook.onclick=()=>openHandbook();
const windowHeader=$('.handbook-header');let windowDrag=null;
windowHeader.addEventListener('pointerdown',event=>{if(matchMedia('(max-width:600px)').matches||event.button!==0||event.target.closest('button'))return;const rect=handbook.getBoundingClientRect();windowDrag={id:event.pointerId,x:event.clientX,y:event.clientY,left:rect.left,top:rect.top};windowHeader.setPointerCapture(event.pointerId);event.preventDefault()});
windowHeader.addEventListener('pointermove',event=>{if(!windowDrag||windowDrag.id!==event.pointerId)return;handbook.style.left=Math.max(0,Math.min(innerWidth-handbook.offsetWidth,windowDrag.left+event.clientX-windowDrag.x))+'px';handbook.style.top=Math.max(0,Math.min(innerHeight-70,windowDrag.top+event.clientY-windowDrag.y))+'px';handbook.style.right='auto'});
function finishWindowDrag(){windowDrag=null}windowHeader.addEventListener('pointerup',finishWindowDrag);windowHeader.addEventListener('pointercancel',finishWindowDrag);windowHeader.addEventListener('lostpointercapture',finishWindowDrag);
window.addEventListener('resize',()=>{if(!handbook.open)return;const rect=handbook.getBoundingClientRect();handbook.style.left=Math.max(0,Math.min(innerWidth-handbook.offsetWidth,rect.left))+'px';handbook.style.top=Math.max(0,Math.min(innerHeight-70,rect.top))+'px';handbook.style.right='auto'});

initStageBackground(document.querySelector('.cube-viewport'));

initCurrentCase({getSnapshot:()=>({state:structuredClone(state),size}),canRead:()=>!processing&&!canvas.dataset.dragMove,toast,applySteps:(snapshot,alg,onDone)=>{if(processing||JSON.stringify(snapshot)!==JSON.stringify(state)){toast('魔方已经变化，请重新读取当前局面');return false}clearSequence();if(currentMode==='timer'&&hasScrambled&&!running&&!timerStartedForRound)startTimer();const tokens=parseAlg(alg);tokens.forEach((token,i)=>queueTurn(token,()=>{history.push(token);if(i===tokens.length-1)onDone()}));return true}});
