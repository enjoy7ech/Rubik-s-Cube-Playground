import fs from 'node:fs';
let game=fs.readFileSync('dist/game.js','utf8');
game=game.replace('let size=3',"let baseline=0, hasScrambled=false, currentMode='free', initialPractice=null;\nlet size=3");
game=game.replace('function draw(){drawCube(canvas,state,size,yaw,pitch)}','function draw(){drawCube(canvas,state,size,yaw,pitch);syncGame()}');
game=game.replace("history=[...moves];$('#scrambleText')","history=[...moves];baseline=history.length;hasScrambled=true;$('#scrambleText')");
game=game.replace('state=createCube(size);history=[];draw();','state=createCube(size);history=[];baseline=0;hasScrambled=false;draw();');
game=game.replace("$('#algForm').onsubmit=e=>{e.preventDefault();","$('#algForm').onsubmit=e=>{e.preventDefault();setMode('formula');");
game+=`\nfunction setMode(mode){currentMode=mode;document.body.dataset.mode=mode;$$('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode))}
function solved(){const colors=new Map();for(const s of state){const face=s.n.join(',');if(colors.has(face)&&colors.get(face)!==s.c)return false;colors.set(face,s.c)}return true}
function syncGame(){const done=solved();$('#turnCount').textContent=Math.max(0,history.length-baseline);$('#gameStatus').textContent=done?'已还原 · 打乱开始一局新游戏':sequence.length?'公式练习 · 一步一步观察':'进行中 · 试着把每一面转成同一种颜色';if(hasScrambled&&done){hasScrambled=false;if(running)toggleTimer();toast('还原成功！这一局是你的啦 ✦')}}
$$('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));setMode('free');
document.addEventListener('keydown',e=>{if(e.repeat||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)||$$('dialog[open]').length)return;const f=e.key.toUpperCase();if(['R','U','F','L','D','B'].includes(f)){e.preventDefault();stopSequence();const token=f+(e.shiftKey?"'":'');move(state,token,size);history.push(token);draw()}});
const params=new URLSearchParams(location.search),incoming=params.get('alg');if(incoming){try{size=Number(params.get('size')||3);if(![2,3,4,5].includes(size))size=3;$('#puzzle').value=String(size);const tokens=parseAlg(incoming);state=createCube(size);if(params.get('setup')==='1'){apply(state,inverse(tokens),size);sequence=tokens;seqIndex=0;initialPractice={state:structuredClone(state),tokens}}else{sequence=tokens;seqIndex=0;initialPractice={state:structuredClone(state),tokens}}$('#algInput').value=incoming;$('#practiceTitle').textContent=params.get('case')||'公式练习';setMode('formula');draw();updateSequence()}catch(e){toast(e.message)}}
$('#practiceReset').onclick=()=>{if(initialPractice){clearInterval(seqInterval);seqInterval=null;state=structuredClone(initialPractice.state);sequence=[...initialPractice.tokens];seqIndex=0;history=[];baseline=0;hasScrambled=false;draw();updateSequence()}else{try{const tokens=parseAlg($('#algInput').value);if(!tokens.length)return toast('先选一个公式吧');stopSequence();state=apply(createCube(size),inverse(tokens),size);sequence=tokens;seqIndex=0;initialPractice={state:structuredClone(state),tokens};history=[];baseline=0;hasScrambled=false;draw();updateSequence()}catch(e){toast(e.message)}}};
`;
fs.writeFileSync('dist/game.js',game);
console.log('Added game modes, keyboard play, move count and completion detection.');
