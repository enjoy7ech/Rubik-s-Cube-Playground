import {AlgorithmPlayer} from './algorithm-player.js';
import {guideNext,stageNames} from './beginner-guide.js';
import {addStageTeaching} from './beginner-teaching.js';

function describe(token){
 const faces={R:'右面',L:'左面',U:'顶面',D:'底面',F:'前面',B:'后面'},whole={x:'整个魔方沿右面的方向',y:'整个魔方沿顶面的方向',z:'整个魔方沿前面的方向'};
 return(faces[token[0]]||whole[token[0]])+(token.includes('2')?'转半圈':token.includes("'")?'逆时针转':'顺时针转')+'（'+token+'）';
}

export function initCurrentCase({getSnapshot,canRead,applySteps,toast}){
 const button=document.createElement('button');button.className='primary current-case-button';button.textContent='✧ 带我一步步还原';document.querySelector('.cube-actions').after(button);
 const panel=document.createElement('dialog');panel.id='currentCaseDialog';panel.setAttribute('aria-labelledby','currentCaseTitle');panel.innerHTML=`<div class="case-match-header"><div><h2 id="currentCaseTitle">我的下一步</h2><p>每个阶段一条固定公式，摆好方向后重复做</p></div><button class="outline small" data-close aria-label="关闭局面助手">关闭</button></div><div class="case-match-body"><label class="base-face-label">我想先拼好哪一面 <select data-base aria-label="选择先拼的面"><option value="D">底面 D</option><option value="U">顶面 U</option><option value="F">前面 F</option><option value="B">后面 B</option><option value="R">右面 R</option><option value="L">左面 L</option></select></label><p data-goal class="layer-goal"></p><button class="outline small" data-refresh>↻ 重新读取当前魔方</button><p data-status role="status"></p><div class="layer-progress"></div><div data-results></div><div class="modal-player" data-preview hidden><canvas aria-label="从当前局面演示下一步" role="img"></canvas><div class="modal-player-steps" data-steps></div><div class="modal-player-controls"><button class="outline small" data-reset>↺ 重播</button><button class="outline small" data-previous>← 上一步</button><button class="primary" data-play>播放</button><button class="outline small" data-next>下一步 →</button><span data-counter></span></div></div><p class="match-footnote">同一阶段的公式不变，变化的是摆放方向和重复次数。演示不改变游玩局面；做完整轮后再读取。</p></div>`;document.body.append(panel);
 const closeButton=panel.querySelector('[data-close]');closeButton.className='close';closeButton.innerHTML=document.querySelector('#helpDialog .close').innerHTML;
 const status=panel.querySelector('[data-status]'),results=panel.querySelector('[data-results]'),refresh=panel.querySelector('[data-refresh]');let player=null,request=0;
 panel.querySelector('[data-close]').onclick=()=>panel.close();panel.addEventListener('close',()=>{request++;player?.close()});
 async function search(){if(!canRead())return toast('等这一转完成，再读取局面');const version=++request,{state,size}=getSnapshot();player?.close();panel.querySelector('[data-preview]').hidden=true;results.replaceChildren();panel.querySelector('.layer-progress').replaceChildren();
  if(size!==3){status.textContent='按层局面匹配目前支持三阶魔方。请切换三阶；其他阶数可继续查阅公式手册。';return}
  refresh.disabled=true;status.textContent='正在按固定入门方法安排摆放和重复次数…';
  try{const match=await guideNext(state,panel.querySelector('[data-base]').value);if(version!==request)return;
   panel.querySelector('.layer-progress').innerHTML=stageNames.map((name,i)=>`<span class="${i<match.stage?'done':i===match.stage?'active':''}">${i<match.stage?'✓ ':''}${name}</span>`).join('');
   const goals=['先认准所选面的中心颜色。把同色的四个棱块放到它周围，并让棱块侧面与相邻中心颜色对齐。','十字已拼好。接下来把这一面的四个角块放进对应角落，侧面颜色也要对齐。','第一层已拼好。把不含对面中心颜色的四个棱块，放进第二层相邻中心之间。','前两层已拼好。接下来让对面中心色的四个棱块朝外，形成顶层十字。','顶层十字已拼好。先让顶层角回到对应角落，暂时不管朝向。','角块位置已正确。重复固定的小循环转正右前上角，再只转顶层换下一个角。下层中途会乱，必须做完整轮才恢复。','角块已归位。最后交换顶层棱块，让所有侧面颜色对齐。'];panel.querySelector('[data-goal]').textContent=goals[match.stage]||'六面已还原，你完成啦！';if(match.stage===7){status.textContent='已经全部拼好啦！';return}
   status.textContent=`下一步：${stageNames[match.stage]} · 已完成 ${match.scores[match.scoreIndex]} / 4`;
   if(!match.results.length){results.textContent='暂时无法安排下一轮，请重新读取当前局面。';return}
   for(const result of match.results){
    const card=document.createElement('article');card.className='matched-formula';
    const title=document.createElement('h3');title.textContent=match.stage===0?'固定方法：小花 → 对齐 → 送到底面':'本阶段只用这一条公式';card.append(title);
    if(result.formula){
     const code=document.createElement('p');code.className='formula';code.textContent=result.formula;card.append(code);
     const explanation=document.createElement('details');explanation.className='guide-notation';const heading=document.createElement('summary');heading.textContent='看懂这条公式怎么转';const translation=document.createElement('p');translation.className='move-translation';translation.textContent=result.formula.split(' ').map(describe).join(' → ');explanation.append(heading,translation);card.append(explanation);
    }else{const rule=document.createElement('p');rule.className='guide-method';rule.textContent='先把四条底色棱搬到顶面，做小花。再转顶层对齐侧色，把对应侧面转半圈送到底面；重复四次。已经在底面的棱可能先取出，完成本轮后统一归位。';card.append(rule)}
    addStageTeaching(card,match.stage,match.teachingState);
    const rounds=document.createElement('details');rounds.className='guide-rounds';const heading=document.createElement('summary');heading.textContent='需要帮助？查看这局的摆放提示';rounds.append(heading);
    const list=document.createElement('ol');for(const part of result.parts){const item=document.createElement('li');if(part.note){const note=document.createElement('p');note.textContent=part.note;item.append(note)}if(part.preparation.length){const prep=document.createElement('p');prep.className='guide-preparation';prep.textContent='先摆放：'+part.preparation.map(describe).join(' → ');item.append(prep)}if(part.formula){const repeat=document.createElement('b');repeat.textContent=match.stage===0?'再转 '+part.formula+'，送到底面':'再重复上面的固定公式 '+part.repeats+' 次';item.append(repeat)}list.append(item)}rounds.append(list);card.append(rounds);
    const play=document.createElement('button');play.className='primary';play.textContent='演示摆放和重复过程';play.onclick=()=>{
     player??=new AlgorithmPlayer(panel.querySelector('[data-preview]'));player.stepDelay=650;player.turnDuration=500;
     player.guideBaseUpdate??=player.update.bind(player);
     player.update=()=>{player.guideBaseUpdate();let cursor=player.index,round=0;while(round<result.parts.length&&cursor>=result.parts[round].tokens.length){cursor-=result.parts[round].tokens.length;round++}const part=result.parts[round],chip=document.createElement('span');chip.className='current';chip.textContent=!part?'本轮完成':cursor<part.preparation.length?'第 '+(round+1)+' 轮，先摆放：'+describe(part.tokens[cursor]):'第 '+(round+1)+' 轮，固定公式第 '+(Math.floor((cursor-part.preparation.length)/part.formula.split(' ').length)+1)+' / '+part.repeats+' 次：'+describe(part.tokens[cursor]);player.steps.replaceChildren(chip)};
     player.load(result.alg,3,state);panel.querySelector('[data-preview]').scrollIntoView({block:'nearest',behavior:'smooth'});
    };
    const doStep=document.createElement('button');doStep.className='outline small';doStep.textContent=match.stage===3?'摆好方向，做一次':'帮我做完整轮';doStep.onclick=()=>{if(applySteps(state,result.alg,()=>{panel.querySelector('[data-base]').value='D';setTimeout(()=>{if(panel.open)search()},0)})){doStep.disabled=true;doStep.textContent='正在做完整轮…'}};card.append(play,doStep);results.append(card);
   }
  }catch(error){if(version===request)status.textContent='读取失败，请重新读取当前局面。'}finally{refresh.disabled=false}
 }
 panel.querySelector('[data-base]').onchange=search;button.onclick=()=>{if(!panel.open)panel.show();search()};refresh.onclick=search;
}
