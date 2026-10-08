import {CubeScene} from './cube-scene.js';
import {createCube,parseAlg,inverse,move,movePlan,apply,drawCube} from './cube.js';
import {$,$$,storage,toast} from './common.js';
const canvas=$('#cube');
const cubeScene=new CubeScene(canvas);
let size=3,state=createCube(),history=[],baseline=0,yaw=-.55,pitch=.5;
let sequence=[],seqIndex=0,playing=false,playTimeout=null,initialPractice=null;
let currentMode='free',hasScrambled=false,timerStartedForRound=false;
let animation=null,turnQueue=[],processing=false,generation=0;
let times=storage.get('times',[]),running=false,start=0,timerFrameId;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function solved(){const colors=new Map();for(const s of state){const face=s.n.join(',');if(colors.has(face)&&colors.get(face)!==s.c)return false;colors.set(face,s.c)}return true}
function draw(){cubeScene.update(state,size,animation)}
function resize(){cubeScene.resize();draw()}
new ResizeObserver(resize).observe(canvas);
function syncGame(){const done=solved();$('#turnCount').textContent=Math.max(0,history.length-baseline);$('#gameStatus').textContent=done?'已还原 · 打乱开始一局新游戏':sequence.length?'公式练习 · 一步一步观察':'进行中 · 试着把每一面转成同一种颜色';if(hasScrambled&&done){hasScrambled=false;if(running)stopTimer();toast('还原成功！这一局是你的啦 ✦');celebrate()}}
function pause(){playing=false;clearTimeout(playTimeout);updateSequence()}
function cancelTurns(){generation++;turnQueue=[];processing=false;animation=null;canvas.dataset.animating='false';pause()}
function clearSequence(){pause();sequence=[];seqIndex=0;initialPractice=null;updateSequence()}
function animateTurn(token,version){const plan=movePlan(token,size),duration=reducedMotion?40:plan.turns===2?430:300;const begin=performance.now();let frames=0;canvas.dataset.animating='true';canvas.dataset.move=token;$('#moveName').textContent=token;return new Promise(resolve=>{function frame(now){if(version!==generation){resolve(false);return}const t=Math.min(1,(now-begin)/duration),eased=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;animation={...plan,angle:plan.dir*plan.turns*Math.PI/2*eased};frames++;canvas.dataset.animationFrames=String(frames);draw();if(t<1){requestAnimationFrame(frame)}else{animation=null;move(state,token,size);canvas.dataset.animating='false';$('#moveName').textContent='';draw();resolve(true)}}requestAnimationFrame(frame)})}
function queueTurn(token,onComplete=()=>{}){try{movePlan(token,size)}catch(e){toast(e.message);return}turnQueue.push({token,onComplete});pump()}
async function pump(){if(processing)return;processing=true;const version=generation;while(turnQueue.length){const job=turnQueue.shift(),completed=await animateTurn(job.token,version);if(!completed)return;job.onComplete();syncGame();updateSequence()}processing=false;updateSequence()}
function manualTurn(token){if(sequence.length)clearSequence();if(currentMode==='timer'&&hasScrambled&&!running&&!timerStartedForRound)startTimer();queueTurn(token,()=>history.push(token))}
function updateSequence(){$('#stepLabel').textContent=sequence.length?seqIndex+' / '+sequence.length+(seqIndex?' · '+sequence[seqIndex-1]:''):'输入公式后开始练习';$('#stepBack').disabled=seqIndex===0||processing;$('#stepNext').disabled=seqIndex>=sequence.length||processing;$('#pause').textContent=playing?'暂停':'继续'}
function nextStep(){if(processing||seqIndex>=sequence.length){if(seqIndex>=sequence.length)pause();return}queueTurn(sequence[seqIndex],()=>{history.push(sequence[seqIndex]);seqIndex++;if(seqIndex>=sequence.length){pause();toast('公式转完啦 ♡')}else if(playing)playTimeout=setTimeout(nextStep,reducedMotion?60:180)})}
function startSequence(){if(!sequence.length)return;if(seqIndex>=sequence.length){toast('点击“从头练习”，再看一遍');return}playing=true;updateSequence();nextStep()}
function setMode(mode){currentMode=mode;document.body.dataset.mode=mode;$$('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode))}
$$('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));setMode('free');
['R','U','F','L','D','B'].forEach(f=>[f,f+"'"].forEach(token=>{const b=document.createElement('button');b.textContent=token;b.setAttribute('aria-label','转动 '+token);b.onclick=()=>manualTurn(token);$('#moves').append(b)}));
$('#reset').onclick=()=>{cancelTurns();clearSequence();if(running)stopTimer(false);state=createCube(size);history=[];baseline=0;hasScrambled=false;timerStartedForRound=false;$('#scrambleText').textContent='准备好了，就转第一下吧。';draw();syncGame()};
$('#puzzle').onchange=()=>{size=Number($('#puzzle').value);$('#reset').click()};
$('#scramble').onclick=()=>{cancelTurns();clearSequence();if(running)stopTimer(false);state=createCube(size);history=[];const tokens=[],faces=['R','U','F','L','D','B'];let last='';for(let i=0;i<(size===2?11:size===3?20:35);i++){let f;do{f=faces[Math.floor(Math.random()*faces.length)]}while(f===last);last=f;const wide=size>3&&Math.random()<.25?'w':'';tokens.push(f+wide+['',"'",'2'][Math.floor(Math.random()*3)])}apply(state,tokens,size);history=[...tokens];baseline=history.length;hasScrambled=true;timerStartedForRound=false;$('#scrambleText').textContent=tokens.join(' ');$('#timer').textContent='00.00';$('#timerStart').textContent='开始计时';draw();syncGame();toast(currentMode==='timer'?'开始转动时自动计时，也可以按空格开始':'新的一局准备好啦！')};
$('#undo').onclick=()=>{if(processing)return;pause();if(sequence.length&&seqIndex>0){const token=sequence[seqIndex-1];queueTurn(inverse([token])[0],()=>{seqIndex--;history.pop()})}else if(history.length>baseline){const token=history.at(-1);queueTurn(inverse([token])[0],()=>history.pop())}else toast('还没有可以撤回的转动')};
$('#stepNext').onclick=()=>{pause();nextStep()};$('#stepBack').onclick=()=>$('#undo').click();$('#pause').onclick=()=>playing?pause():startSequence();
$('#algForm').onsubmit=e=>{e.preventDefault();setMode('formula');try{const tokens=parseAlg($('#algInput').value);if(!tokens.length)return toast('先输入一个公式吧');tokens.forEach(t=>movePlan(t,size));if(tokens.join(' ')!==sequence.join(' ')||!sequence.length){cancelTurns();sequence=tokens;seqIndex=0;initialPractice={state:structuredClone(state),tokens:[...tokens]}}startSequence()}catch(err){toast(err.message)}};
$('#practiceReset').onclick=()=>{try{cancelTurns();const tokens=initialPractice?.tokens||parseAlg($('#algInput').value);if(!tokens.length)return toast('先选一个公式吧');state=initialPractice?structuredClone(initialPractice.state):apply(createCube(size),inverse(tokens),size);initialPractice={state:structuredClone(state),tokens:[...tokens]};sequence=[...tokens];seqIndex=0;history=[];baseline=0;hasScrambled=false;draw();syncGame();updateSequence()}catch(e){toast(e.message)}};
function format(t){return(t/1000).toFixed(2)}
function clockFrame(){if(running){$('#timer').textContent=format(performance.now()-start);timerFrameId=requestAnimationFrame(clockFrame)}}
function startTimer(){running=true;timerStartedForRound=true;start=performance.now();$('#timerStart').textContent='停止计时';clockFrame()}
function stopTimer(save=true){if(!running)return;const elapsed=performance.now()-start;running=false;cancelAnimationFrame(timerFrameId);if(save){times.push(elapsed);storage.set('times',times);$('#timer').textContent=format(elapsed)}else $('#timer').textContent='00.00';$('#timerStart').textContent='再来一次';renderTimes()}
function toggleTimer(){running?stopTimer():startTimer()}
function renderTimes(){$('#attempts').textContent=times.length;$('#best').textContent=times.length?format(Math.min(...times))+' s':'—';const last=times.slice(-5).sort((a,b)=>a-b);$('#ao5').textContent=last.length===5?format(last.slice(1,-1).reduce((s,v)=>s+v,0)/3)+' s':'—';$('#history').innerHTML=times.length?times.slice(-20).reverse().map((t,i)=>`<div><span># ${times.length-i}</span><span>${format(t)} s</span></div>`).join(''):'还没有记录，开始第一局挑战吧。'}
$('#timer').onclick=$('#timerStart').onclick=toggleTimer;$('#clearTimes').onclick=()=>{times=[];storage.set('times',times);renderTimes();toast('记录已清空')};
document.addEventListener('keydown',e=>{if(e.repeat||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)||$$('dialog[open]').length)return;const f=e.key.toUpperCase();if(['R','U','F','L','D','B'].includes(f)){e.preventDefault();manualTurn(f+(e.shiftKey?"'":''))}else if(e.code==='Space'){e.preventDefault();setMode('timer');toggleTimer()}else if(e.key==='/'){e.preventDefault();location.href='library.html'}});
function celebrate(){if(reducedMotion)return;const colors=['#e9b0bb','#b0d1a0','#f0d58d','#b6c9e3'];for(let i=0;i<24;i++){const p=document.createElement('i');p.className='win-paper';p.style.setProperty('--x',(Math.random()*90+5)+'%');p.style.setProperty('--drift',(Math.random()*140-70)+'px');p.style.background=colors[i%colors.length];p.style.animationDelay=(Math.random()*.25)+'s';$('.game-stage').append(p);setTimeout(()=>p.remove(),1800)}}
const params=new URLSearchParams(location.search),incoming=params.get('alg');if(incoming){try{size=Number(params.get('size')||3);if(![2,3,4,5].includes(size))size=3;$('#puzzle').value=String(size);const tokens=parseAlg(incoming);state=createCube(size);if(params.get('setup')==='1')apply(state,inverse(tokens),size);sequence=tokens;initialPractice={state:structuredClone(state),tokens:[...tokens]};$('#algInput').value=incoming;$('#practiceTitle').textContent=params.get('case')||'公式练习';setMode('formula')}catch(e){toast(e.message)}}
renderTimes();updateSequence();syncGame();resize();
