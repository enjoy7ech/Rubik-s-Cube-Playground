import {sampleFor,topView,stripView,crossBottom,daisyExample,whiteCrossFinalExample,insertionDiagram,fishConversionExample} from './tutorial-diagrams.js';
export const algorithms={trigger:"R U R' U'",right:"U R U' R' U' F' U F",left:"U' L' U L U F U' F'",cross:"F R U R' U' F'",fish1:"R U R' U R U2 R'",fish2:"R U2 R' U' R U' R'",eyes:"R U R' U' R' F R2 U' R' U' R U R' F'",edges:"R2 U R U R' U' R' U' R' U R'"};
const c=(name,look,hold,act,then,alg=null,diagram=null)=>({name,look,hold,act,then,alg,diagram});
export const lessons=[
 {title:'白色十字',goal:'把四条白棱放到底面，侧色对齐中心。',check:'底面白十字，四个侧面出现同色的“中心＋底棱”。',cases:[
  c('先做白色小花','找两色的白棱，白角先不管。','黄色中心朝上。顶层先转出空位。','把白棱搬到顶面，直到四片白花瓣围住黄中心。','小花齐了，再送到底面。',null,()=>topView(daisyExample(),{ignoreCorners:true,focusColor:1})),
  c('对齐，再送到底面','看一片白花瓣的另一种颜色。','只转顶层，让侧色对齐同色中心。','把这一侧转半圈（F2 / R2 / B2 / L2），重复四次。','白十字完成；顶面不需要同时出现黄十字。',null,()=>crossBottom(whiteCrossFinalExample()))]},
 {title:'小循环 · 拼白色角块',goal:'把白角放进白十字旁边，完成第一层。',check:'底面全白，四个侧面的底排也同色。',cases:[
  c('白角在顶层','白角的另外两色，决定它属于哪个角落。','目标槽放在右前下，白角转到正上方。','完整做小循环，重复直到白角入槽。','再找下一个白角，还是同一公式。',algorithms.trigger,()=>crossBottom(sampleFor(algorithms.trigger))),
  c('白角在底层，但放错了','白角的侧色不属于这一槽。','把错位角放在右前下。','先做一次小循环取出，再按“白角在顶层”处理。','不要硬转底层破坏白十字。',algorithms.trigger)]},
 {title:'插棱公式 · 拼中层',goal:'把不含黄色的棱放进中层，完成前两层。',check:'四个侧面的下面两排全部同色。',cases:[
  c('往右插','顶层棱不含黄；另一色属于右面。','前面的侧色对齐前中心。','做一次右插公式。','这条棱进入前、右中心之间。',algorithms.right,()=>insertionDiagram(algorithms.right)),
  c('往左插','顶层棱不含黄；另一色属于左面。','前面的侧色对齐前中心。','做一次左插公式。','这条棱进入前、左中心之间。',algorithms.left,()=>insertionDiagram(algorithms.left,true)),
  c('中层放错／顶层找不到目标棱','目标棱已经卡在错误的中层槽里。','把错槽放在右前中层。','用右插把它换到顶层，再对齐并选择左插或右插。','做完整组后，第一层会保留。',algorithms.right)]},
 {title:'造十字公式 · 翻黄棱',goal:'只把四条黄棱翻朝上。灰格不用管，图的下方是前面 F。',check:'黄色中心周围四条黄棱朝上。角块、侧色暂时不管。',cases:[
  c('点','四条黄棱都没朝上。','方向任意，黄色始终在上。','做一次造十字公式。','变成小拐角。',algorithms.cross,()=>topView(sampleFor(algorithms.cross+' U2 '+algorithms.cross+' '+algorithms.cross),{ignoreCorners:true})),
  c('小拐角','两条相邻的黄棱朝上。','把两条黄棱摆在左、上，像左上角的 L。','做一次同样的公式。','变成一字线。',algorithms.cross,()=>topView(sampleFor(algorithms.cross+' '+algorithms.cross),{ignoreCorners:true})),
  c('一字线','两条相对的黄棱朝上。','把黄色直线水平摆放。','做一次同样的公式。','黄色十字完成。',algorithms.cross,()=>topView(sampleFor(algorithms.cross),{ignoreCorners:true})),
  c('十字 · 已完成','四条黄棱都朝上。','保持白底黄顶。','停止造十字公式，进入小鱼翻色。','角块和侧色留到后面的步骤。',null,()=>topView(sampleFor(''),{ignoreCorners:true}))]},
 {title:'小鱼公式 · 翻黄角',goal:'黄十字做好后，用同一条小鱼公式翻黄角，直到顶面全黄。',check:'顶面全黄，前两层保持完成；侧面顶排可能仍乱。',cases:[
  c('只有一个黄角朝上','这个黄角就是鱼头。','只转顶层，把鱼头放在左下（左前上角）。','完整做一次小鱼公式。','可能全黄，也可能变成别的形态；重新摆好，继续同一公式。',algorithms.fish1,()=>topView(sampleFor(algorithms.fish1),{sideHints:true})),
  c('没有黄角朝上','四个黄角的黄色都朝侧面。','只转顶层，让左前上角的黄色朝左。','完整做一次同样的小鱼公式。','变成一条小鱼，再把鱼头放左下，继续。',algorithms.fish1,()=>topView(fishConversionExample(0,algorithms.fish1,algorithms.fish2),{sideHints:true})),
  c('两个黄角朝上','有两个黄角朝上。','只转顶层，让左前上角的黄色朝前。','完整做一次同样的小鱼公式。','变成一条小鱼，再把鱼头放左下，继续。',algorithms.fish1,()=>topView(fishConversionExample(2,algorithms.fish1,algorithms.fish2),{sideHints:true}))]},
 {title:'换角公式 · 角块归位',goal:'顶面全黄后，只调整四个角的位置。',check:'四个侧面的顶排两端都与中心同色，中间棱块可暂时错位。',cases:[
  c('有一对眼睛','某一侧顶排最左、最右两块同色，中间可以不同色。','把这对“眼睛”放在左侧。','做一次角块置换公式，最后只转 U 对齐中心。','角块归位，接着处理棱块。',algorithms.eyes,()=>stripView(sampleFor(algorithms.eyes),'L')),
  c('没有眼睛','四个侧面都找不到同色的双角。','黄色在上，任意侧面朝前。','先做一次角块置换，再重新寻找眼睛。','有眼睛后，放在左侧再做；每次完整做公式。',algorithms.eyes),
  c('四侧都有眼睛','每个侧面的两角都同色，只是还没对齐中心。','黄色在上，看侧面中心的颜色。','只转 U / U′ / U2 对齐，不做角块置换。','角已归位，直接进入三棱换。',null,()=>stripView(sampleFor('U')))]},
 {title:'三棱换公式 · 最后还原',goal:'角块不动，交换最后几条顶层棱。',check:'六个面都与中心同色。',cases:[
  c('有一个完整侧面','一侧的顶排三块都与中心同色，整面已拼好。','把完整侧面放在后面 B。','做三棱换公式。若方向相反，再完整做一次。','最后转 U 对齐，六面完成。',algorithms.edges,()=>stripView(sampleFor(algorithms.edges),'B')),
  c('没有完整侧面','角块已好，但四个侧面的中间棱都不对。','黄色在上，任意方向开始。','先做一次三棱换，再找已经拼好的侧面。','把完整面放到后面，继续同一公式。',algorithms.edges)]}
];
lessons[1].cases[0].sample=()=>sampleFor(algorithms.trigger);
lessons[2].cases[0].sample=()=>sampleFor(algorithms.right);
lessons[2].cases[1].sample=()=>sampleFor(algorithms.left);
lessons[3].cases[0].sample=()=>sampleFor(algorithms.cross+' U2 '+algorithms.cross+' '+algorithms.cross);
lessons[3].cases[1].sample=()=>sampleFor(algorithms.cross+' '+algorithms.cross);
lessons[3].cases[2].sample=()=>sampleFor(algorithms.cross);
lessons[4].cases[0].sample=()=>sampleFor(algorithms.fish1);
lessons[4].cases[1].sample=()=>fishConversionExample(0,algorithms.fish1,algorithms.fish2);
lessons[4].cases[2].sample=()=>fishConversionExample(2,algorithms.fish1,algorithms.fish2);
lessons[5].cases[0].sample=()=>sampleFor(algorithms.eyes);
lessons[6].cases[0].sample=()=>sampleFor(algorithms.edges);
const formulaLessons=[
 {name:'对齐颜色，再转半圈',formula:null,use:'这一课先不用背长公式：把白棱送到白色中心周围。',steps:['先在黄中心周围凑四片白花瓣。','转顶层，让一片花瓣的侧色对齐同色中心，再把这一侧转半圈。','四片花瓣都送到底面后，白十字就好了。']},
 {name:'小循环',formula:algorithms.trigger,use:'把右前上方的白角送进右前下方的角槽。',steps:['先找白角的另外两色，把对应的角槽放在右前下；白角放到它正上方。','重复完整的四步小循环，直到这颗白角入槽。中途不要停、不要改拿法。','换下一个白角，仍然用这四步。底层错角也可先用一次小循环取出。']},
 {name:'右插公式',formula:algorithms.right,use:'把顶层的一条棱，放进前、右两面之间的中层槽。',steps:['找一条不含黄色的顶层棱，转顶层，让它的侧色对齐前面中心。','看它朝上的颜色：属于右面，就完整做一次右插。','继续找下一条棱。若目标棱卡在中层错槽，先用右插把它换出来。'],extra:{name:'往左时用左插',formula:algorithms.left,text:'侧色仍对齐前中心；朝上的颜色属于左面时，完整做一次左插。'}},
 {name:'造十字公式',formula:algorithms.cross,use:'翻转顶层棱块，让四条黄棱朝上。前两层会保留。',steps:['黄色在上。点形任意拿；小拐角放左上；一字线横着放。','完整做一次公式，再看顶面。按“点 → 小拐角 → 一字线 → 十字”前进。','每次只重新摆方向，公式一直相同；看到黄十字就停。']},
 {name:'小鱼公式',formula:algorithms.fish1,use:'翻转顶层角块，把黄十字变成全黄顶面。黄十字和前两层会保留。',steps:['黄色在上，先数朝上的黄角：1 个，把鱼头放左下；0 个，让左前上角的黄贴朝左；2 个，让它朝前。','完整做一次这七步。还没全黄？重新按上一条摆好，再做同一公式。','最多三轮就能翻满顶面。每轮都要重新观察、摆放；全黄立即停。']},
 {name:'换角公式',formula:algorithms.eyes,use:'顶面全黄后，调整四个顶层角的位置。',steps:['找一侧顶排两端的同色角块——这对“眼睛”放左侧。','完整做一次换角。没有眼睛时先任意拿着做一次，再把出现的眼睛放左侧继续。','四侧都有眼睛后，只转顶层对齐中心，停止换角。中间的棱下一课再管。']},
 {name:'三棱换公式',formula:algorithms.edges,use:'保留已经归位的角块，只交换三条顶层棱。',steps:['把拼好的完整侧面放在后面 B。没有完整面？先任意拿着做一次，再找完整面。','完整做一次；还没还原，就保持完整面在后面，再做一次同样的公式。','六面都同色就停。别在中间拆开公式执行。']}
];
export function renderLesson(container,index,{compact=false,caseDemo=null}={}){
 const lesson=lessons[index],section=document.createElement('section');section.className='method-lesson';
 const method=formulaLessons[index],hero=document.createElement('div');hero.className='formula-guide';
 const name=document.createElement('h3');name.textContent=method.name;hero.append(name);
 if(method.formula&&!compact){const formula=document.createElement('p');formula.className='formula formula-main';formula.textContent=method.formula;hero.append(formula)}
 const purpose=document.createElement('p');purpose.className='formula-purpose';purpose.textContent=method.use;hero.append(purpose);
 const steps=document.createElement('ol');for(const text of method.steps){const item=document.createElement('li');item.textContent=text;steps.append(item)}hero.append(steps);
 if(method.extra){const extra=document.createElement('details'),summary=document.createElement('summary'),code=document.createElement('p'),text=document.createElement('p');extra.className='formula-extra';summary.textContent=method.extra.name;code.className='formula';code.textContent=method.extra.formula;text.textContent=method.extra.text;extra.append(summary,code,text);hero.append(extra)}
 section.append(hero);
 const grid=document.createElement('div');grid.className='method-cases'+(index===3?' process-flow':'');
 for(const entry of lesson.cases){const card=document.createElement('article');card.className='method-case';const heading=document.createElement('h3');heading.textContent=entry.name;card.append(heading);
  if(entry.diagram){const figure=document.createElement('div');figure.className='method-diagram';figure.innerHTML=entry.diagram();card.append(figure)}
  const look=document.createElement('p');look.className='case-identify';look.textContent=entry.look;card.append(look);
  for(const [label,value]of [['摆放：',entry.hold],['操作：',entry.act]]){const p=document.createElement('p');const b=document.createElement('strong');b.textContent=label;p.append(b,document.createTextNode(value));card.append(p)}
  const result=document.createElement('p');result.className='case-result';result.textContent='→ '+entry.then;card.append(result);
  if(entry.alg&&caseDemo&&entry.sample)caseDemo(card,entry);grid.append(card);
 }
 if(compact)section.append(grid);else{const diagrams=document.createElement('details'),summary=document.createElement('summary');diagrams.className='formula-illustrations';summary.textContent='看摆放图与单次演示';diagrams.append(summary,grid);section.append(diagrams)}
 const check=document.createElement('p');check.className='method-check';check.textContent='什么时候停：'+lesson.check;section.append(check);container.append(section);return section;
}
