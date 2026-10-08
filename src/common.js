export const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
export const storage={get(k,f){try{return JSON.parse(localStorage.getItem('fangcun-'+k))??f}catch{return f}},set(k,v){try{localStorage.setItem('fangcun-'+k,JSON.stringify(v))}catch{toast('当前浏览器无法保存记录')}}};
let toastTimer;export function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2400)}
$$('dialog .close').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$$('dialog').forEach(d=>d.onclick=e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}});
$('.help-button')?.addEventListener('click',()=>$('#helpDialog').showModal());
