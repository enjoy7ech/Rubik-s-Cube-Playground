import {walkthrough} from './tutorial-walkthrough.js';
import {createCube,parseAlg,inverse,apply,palette} from './cube.js';
import {addYellowCrossTeaching} from './beginner-teaching.js';

export const guides={beginner:[
 {purpose:'把四条白棱放到白色中心周围，并让它们的侧色对齐中心。',brief:'先做一朵白色小花，再一条条送到底面。\n角块先不用管，只看有两种颜色的棱块。',check:'底面出现白十字，四条棱的侧色也与中心同色。顶面是否形成黄十字，这一步不用管。',captions:['白棱分散，还没形成小花。','四片白花瓣围住黄色中心。','底面白十字完成；顶面黄十字还没好。']},
 {purpose:'把白角放进白十字四周的角落，拼好整个第一层。',brief:'白角有三种颜色，用另外两色找它该去的角落。\n先带到槽位上方，再跟着演示放进底层。',check:'底面全白，四个侧面的底排也都与中心同色。',captions:['十字已完成，但白角还没放齐。','白角全部归位，第一层拼好。']},
 {purpose:'把顶层的不含黄色的棱，放进中层对应位置。',brief:'先看棱块的两种颜色，找到它该去的两个中心。\n一色对齐前面，另一色决定往左插还是往右插。',check:'四个侧面的下面两排都与中心同色。'},
 {purpose:'把顶层四条棱的黄色转朝上，先做黄色十字。',brief:'只看黄色棱块，黄角暂时不用管。\n本局从点形开始，摆好方向，重复同一组公式。侧色现在不必对齐。',check:'黄色中心周围有四条朝上的黄棱。',captions:['前两层已好，黄棱都没朝上：点形。','黄十字出现，角块和侧色留到后面处理。']},
 {purpose:'让四个黄角回到属于自己的角落，先解决“位置”。',brief:'看黄角的三种颜色，找对应的三个中心。\n按演示交换角块；黄色此时不用朝上。',check:'每个黄角的三种颜色都属于所在角落。',captions:['黄十字已好，但角块占错了角落。','四个角落都正确，黄色仍可能朝侧面。']},
 {purpose:'角块位置已正确，现在只把它们的黄色转朝上。',brief:'把要转正的角放在右前上，做完整个小循环。\n只转顶层换下一个角，不要转整个魔方。',check:'顶面全黄，前两层恢复。中途下层暂时变乱是正常的，必须做完整课。',captions:['角块位置正确，黄色朝向还不统一。','黄角全部转正，顶面同色，前两层恢复。']},
 {purpose:'把最后几条顶层棱换到正确位置，完成六面还原。',brief:'现在黄色已朝上，角块也已归位。\n跟着演示交换棱块，让它们的侧色对齐中心。',check:'六个面都与各自中心同色，整局还原完成。',captions:['黄色顶面已好，侧面顶排还错色。','顶层棱归位，六面全部还原。']}
 ],cfop:[
 {purpose:'先把四条底层棱拼成十字，为后面的角棱配对打底。',brief:'找白棱，既要白色朝下，也要侧色对齐中心。\n下面展示直接拼十字的一条样例路线。',check:'底面白十字和四个侧色同时正确。',captions:['从打乱样例找四条白棱。','直接完成底层十字，角块暂时不用管。']},
 {purpose:'把一个白角和一条中层棱配成一对，一起放进同一个槽位。',brief:'找颜色对应的角和棱，不是随便两块。\n先配对，再插入；这样一次就能推进两层。',check:'这一槽里的角与棱都对齐中心，底层十字保留。',captions:['这一对角棱还在顶层，槽位没拼好。','角棱一起入槽；其他槽位在本例中已完成。']},
 {purpose:'前两层已经完成，只把顶层的黄色转朝上。',brief:'看顶面黄色的形状，选择相应的定向步骤。\n下图是一种样例，不是所有顶层局面都用同一条公式。',check:'整个顶面同色，前两层保持完成。',captions:['黄色朝向不统一，前两层已好。','顶面全黄，侧面顶排可能仍需换位。']},
 {purpose:'保持顶面同色，交换顶层块的位置，让侧色对齐中心。',brief:'先分清哪些块需要换位置，再选对应的排列步骤。\n下图展示一种换位样例；完成后可能还需转顶层对齐。',check:'顶排侧色对齐，六个面都与中心同色。',captions:['顶面已同色，但侧面顶排没对齐。','顶层位置正确，这个样例已完整还原。']}
 ]};

function net(state,stage,key,after){
 const cells=new Map(state.map(s=>[[...s.p,...s.n].join(','),s.c]));
 const emphasis=(p,n)=>{
  const edge=p.filter(v=>v!==0).length===2,corner=p.filter(v=>v!==0).length===3;
  if(key==='beginner')return stage===0?(edge&&(n[1]!==0)):stage===1?(corner&&p[1]===-1):stage===3?(edge&&p[1]===1):stage===4||stage===5?(corner&&p[1]===1):edge&&p[1]===1;
  return stage===0?edge&&p[1]===-1:stage===1?p[0]===1&&p[2]===1:stage===2?n[1]===1:p[1]===1&&n[1]===0;
 };
 function face(label,x,y,normal,position){let svg=`<text x="${x+32}" y="${y-7}" text-anchor="middle" font-size="10" fill="#8c9a80">${label}</text>`;for(let row=0;row<3;row++)for(let col=0;col<3;col++){const p=position(row,col),focus=emphasis(p,normal);svg+=`<rect x="${x+col*22}" y="${y+row*22}" width="20" height="20" rx="4" fill="${palette[cells.get([...p,...normal].join(','))]}" stroke="${focus?'#8ca576':'#dfe3d7'}" stroke-width="${focus?1.8:1}"/>`}return svg}
 return `<svg viewBox="0 0 224 270" role="img" aria-label="${after?'本步骤完成后的真实样例展开图':'本步骤开始时的真实样例展开图'}">${face('顶面 U',30,22,[0,1,0],(r,c)=>[c-1,1,r-1])}${face('前面 F',30,104,[0,0,1],(r,c)=>[c-1,1-r,1])}${face('右面 R',124,104,[1,0,0],(r,c)=>[1,1-r,1-c])}${face('底面 D',30,187,[0,-1,0],(r,c)=>[c-1,-1,1-r])}</svg>`;
}
export function addLessonGuide(lesson,key,index,alg,customInitial){
 const guide=guides[key][index];
 if(key==='beginner'&&index===2)return;
 const initial=key==='beginner'?walkthrough[index].initial:customInitial||apply(createCube(),inverse(parseAlg(alg))),final=key==='beginner'?walkthrough[index].final:apply(structuredClone(initial),parseAlg(alg));
 const states=key==='beginner'&&index===0?[initial,apply(structuredClone(initial),parseAlg(walkthrough[0].alg).slice(0,4)),final]:[initial,final];
 const section=document.createElement('section');section.className='middle-explainer lesson-picture-guide';section.setAttribute('aria-label','本课目的与前后示意');
 const purpose=document.createElement('div');purpose.className='middle-purpose';const heading=document.createElement('b');heading.textContent='这一步解决什么？';const p=document.createElement('p');p.textContent=guide.purpose;purpose.append(heading,p);section.append(purpose);
 if(key==='beginner'&&index===3)addYellowCrossTeaching(section,initial);
 const figures=document.createElement('div');figures.className='middle-diagram-pair'+(states.length===3?' three-diagrams':'');
 for(const [i,state]of states.entries()){const figure=document.createElement('figure');figure.innerHTML=net(state,index,key,i===states.length-1);const caption=document.createElement('figcaption'),b=document.createElement('b'),span=document.createElement('span');b.textContent=states.length===3?['① 起点','② 小花完成','③ 白十字完成'][i]:i===0?'① 开始时':'② 完成后';span.textContent=guide.captions[i];caption.append(b,span);figure.append(caption);figures.append(figure)}if(key==='beginner'&&index===3){const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='查看本局演示前后的展开图';details.append(summary,figures);section.append(details)}else section.append(figures);
 const check=document.createElement('p');check.className='middle-read-guide';const b=document.createElement('strong');b.textContent='怎样算完成：';check.append(b,document.createTextNode(guide.check));section.append(check);
 const note=document.createElement('p');note.className='picture-key';note.textContent='绿线框标出要检查的位置。棱有两色，角有三色。左、后两面可在三维演示中转动查看。';section.append(note);lesson.append(section);
}
