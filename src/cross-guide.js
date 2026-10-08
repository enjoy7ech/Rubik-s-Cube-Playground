import {move} from './cube.js';
const moves=['U','D','R','L','F','B'].flatMap(f=>[f,f+"'",f+'2']),locations=[];
for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++)if(Math.abs(x)+Math.abs(y)+Math.abs(z)===2)for(let axis=0;axis<3;axis++){const p=[x,y,z];if(p[axis]){const n=[0,0,0];n[axis]=p[axis];locations.push({p,n,c:0})}}
const code=s=>locations.findIndex(l=>l.p.join(',')===s.p.join(',')&&l.n.join(',')===s.n.join(','));
const transitions=locations.map(l=>moves.map(t=>code(move(structuredClone([l]),t,3)[0])));
const pack=a=>((a[0]*24+a[1])*24+a[2])*24+a[3],unpack=k=>{const a=[];for(let i=3;i>=0;i--){a[i]=k%24;k=Math.floor(k/24)}return a};
const goals=[[0,-1,1],[1,-1,0],[0,-1,-1],[-1,-1,0]].map(p=>code({p,n:[0,-1,0]}));let database=null;
async function distances(){if(database)return database;database=(async()=>{const d=new Uint8Array(24**4);d.fill(255);const q=new Uint32Array(24**4);let head=0,tail=1;q[0]=pack(goals);d[q[0]]=0;while(head<tail){const key=q[head++],a=unpack(key);for(let m=0;m<18;m++){const next=pack(a.map(v=>transitions[v][m]));if(d[next]===255){d[next]=d[key]+1;q[tail++]=next}}if(head%5000===0)await new Promise(r=>setTimeout(r,0))}return d})();return database}
export async function crossSteps(state){
 const centers=new Map(state.filter(s=>s.p.filter(v=>v!==0).length===1).map(s=>[s.n.join(','),s.c])),bottom=centers.get('0,-1,0'),white=state.filter(s=>s.c===bottom&&s.p.filter(v=>v!==0).length===2);
 const sideNormals=[[0,0,1],[1,0,0],[0,0,-1],[-1,0,0]],codes=sideNormals.map(n=>{const side=centers.get(n.join(','));return code(white.find(w=>state.some(s=>s.p.join(',')===w.p.join(',')&&s.c===side))) });
 const d=await distances(),tokens=[];let current=codes;
 while(d[pack(current)]>0&&tokens.length<12){const distance=d[pack(current)];let found=false;for(let m=0;m<18;m++){const next=current.map(v=>transitions[v][m]);if(d[pack(next)]===distance-1){tokens.push(moves[m]);current=next;found=true;break}}if(!found)break}
 return tokens;
}
