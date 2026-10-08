const modes=document.querySelector('.game-modes');
if(modes){
 const select=document.createElement('select');select.className='mobile-mode-select';select.setAttribute('aria-label','游戏模式');
 for(const button of modes.querySelectorAll('button')){const option=document.createElement('option');option.value=button.dataset.mode;option.textContent=button.textContent;select.append(option)}
 select.onchange=()=>modes.querySelector(`[data-mode="${select.value}"]`).click();modes.after(select);
 const sync=()=>select.value=document.body.dataset.mode||'free';sync();new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['data-mode']});
}
const moves=document.querySelector('#moves');
if(moves){const tools=document.createElement('details');tools.className='mobile-turn-tools';const summary=document.createElement('summary');summary.textContent='按面转动';moves.before(tools);tools.append(summary,moves);const mobile=matchMedia('(max-width:600px)');const sync=()=>tools.open=!mobile.matches;sync();mobile.addEventListener('change',sync)}
const handbook=document.querySelector('#handbookDialog');
if(handbook){
 document.querySelector('.side-rail nav a[href="index.html"]')?.addEventListener('click',event=>{event.preventDefault();if(handbook.open)handbook.close()});
 const sync=()=>document.body.classList.toggle('mobile-handbook-open',handbook.open);
 new MutationObserver(sync).observe(handbook,{attributes:true,attributeFilter:['open']});sync();
}
