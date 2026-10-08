// Sticker coordinates use +x right, +y up, +z front. No external runtime.
export const palette=['#f6de88','#faf6e9','#eba6b1','#e8bb88','#a7d3b8','#a9c9df'];
export const faces=[[[0,1,0],0],[[0,-1,0],1],[[1,0,0],2],[[-1,0,0],3],[[0,0,1],4],[[0,0,-1],5]];
export function createCube(size=3){const m=(size-1)/2,out=[];for(const [n,c] of faces){const axis=n.findIndex(v=>v!==0),other=[0,1,2].filter(v=>v!==axis);for(let a=0;a<size;a++)for(let b=0;b<size;b++){const p=[0,0,0];p[axis]=n[axis]*m;p[other[0]]=a-m;p[other[1]]=b-m;out.push({p,n:[...n],c});}}return out;}
export function parseAlg(alg){const tokens=alg.replace(/[’′]/g,"'").replace(/[()\[\]]/g,' ').trim().split(/\s+/).filter(Boolean);for(const t of tokens)if(!/^(?:[2-9]?[RLUDFB]w?|[rludfbMESxyz])(?:2'?|')?$/.test(t))throw Error('暂不支持记号：'+t);return tokens;}
export function inverse(tokens){return [...tokens].reverse().map(t=>t.includes('2')&&!/^[2-9][RLUDFB]/.test(t)?t.replace("'",''): /2'?$/.test(t)?t.replace(/2'$/,'2'):t.endsWith("'")?t.slice(0,-1):t+"'");}
function rotate(v,axis,dir){const a=(axis+1)%3,b=(axis+2)%3,copy=[...v];copy[a]=-dir*v[b];copy[b]=dir*v[a];return copy;}
export function movePlan(token,size=3){const m=(size-1)/2,match=token.match(/^([2-9]?)([A-Za-z])([w]?)(2'?|')?$/);if(!match)throw Error(token);const [,prefix,f,w,suffix]=match,whole='xyz'.includes(f),slice='MES'.includes(f),wide=!!w||'rludfb'.includes(f),upper=f.toUpperCase();const spec={R:[0,1,-1],L:[0,-1,1],U:[1,1,-1],D:[1,-1,1],F:[2,1,-1],B:[2,-1,1],M:[0,0,1],E:[1,0,1],S:[2,0,-1],X:[0,0,-1],Y:[1,0,-1],Z:[2,0,-1]}[upper];if(!spec)throw Error(token);const[axis,side,direction]=spec,dir=direction*(suffix==="'"?-1:1),turns=suffix?.startsWith('2')?2:1,width=prefix?Number(prefix):wide?2:1;if(width>size)throw Error('层数超过魔方阶数');return{axis,dir,turns,selected:p=>whole||(slice?Math.abs(p[axis])<m:prefix&&!wide?side*p[axis]===m-width+1:side*p[axis]>m-width)}}
export function move(state,token,size=3){const plan=movePlan(token,size);for(let i=0;i<plan.turns;i++)for(const sticker of state)if(plan.selected(sticker.p)){sticker.p=rotate(sticker.p,plan.axis,plan.dir);sticker.n=rotate(sticker.n,plan.axis,plan.dir)}return state;}
export function apply(state,tokens,size=3){for(const t of tokens)move(state,t,size);return state;}
export function drawCube(canvas,state,size=3,yaw=-.55,pitch=.5,animation=null){
 const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);
 const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
 const transform=v=>{const x=v[0]*cy+v[2]*sy,z=-v[0]*sy+v[2]*cy;return[x,v[1]*cp-z*sp,v[1]*sp+z*cp]};
 const turn=v=>{if(!animation)return v;const out=[...v],a=(animation.axis+1)%3,b=(animation.axis+2)%3,c=Math.cos(animation.angle),s=Math.sin(animation.angle);out[a]=v[a]*c-v[b]*s;out[b]=v[a]*s+v[b]*c;return out};
 const scale=Math.min(w,h)*.58/size,center=[w/2,h/2],polygons=[];
 function add(p,n,c,extent,offset){const selected=animation?.selected(p),normal=transform(selected?turn(n):n);if(normal[2]<.001)return;const axis=n.findIndex(v=>v),axes=[0,1,2].filter(v=>v!==axis);const corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>{let v=p.map((x,i)=>x+n[i]*offset);v[axes[0]]+=a*extent;v[axes[1]]+=b*extent;if(selected)v=turn(v);return transform(v)});polygons.push({corners,depth:corners.reduce((s,v)=>s+v[2],0)/4,c,shade:normal[2]})}
 // Render the cubie bodies too: exposed interior surfaces stay solid during turns.
 const m=(size-1)/2;for(let x=0;x<size;x++)for(let y=0;y<size;y++)for(let z=0;z<size;z++){if(x>0&&x<size-1&&y>0&&y<size-1&&z>0&&z<size-1)continue;for(const[n]of faces)add([x-m,y-m,z-m],n,null,.49,.49)}
 for(const st of state)add(st.p,st.n,st.c,.443,.503);
 polygons.sort((a,b)=>a.depth-b.depth);ctx.save();ctx.lineJoin='round';ctx.lineWidth=Math.max(.5,w/650);
 for(const p of polygons){ctx.beginPath();p.corners.forEach((v,i)=>{const x=center[0]+v[0]*scale,y=center[1]-v[1]*scale;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.fillStyle=p.c===null?'#637059':palette[p.c];ctx.fill();ctx.strokeStyle=p.c===null?'#637059':'#65705c';ctx.stroke()}
 ctx.restore();
}
