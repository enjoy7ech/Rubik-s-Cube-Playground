import {createCube,apply,parseAlg,inverse} from './cube.js';
import {sampleFor,faceGrid,topView,pllDiagram} from './tutorial-diagrams.js';
import {algorithms} from './tutorial-content.js';

const crossAlgorithm="F R2 U B2 L'";
const crossSetup=algorithms.trigger+' '+inverse(parseAlg(crossAlgorithm)).join(' ');
const crossSample=()=>apply(sampleFor(algorithms.trigger),inverse(parseAlg(crossAlgorithm)));
export const advancedCourses={
 cfop:{title:'CFOP · 从层先到配对',intro:'会基础还原后，先练角棱配对，再逐渐减少顶层步骤。路线是 Cross → F2L → OLL → PLL。每课的演示是独立的练习局面。',sources:[['CubeSkills · F2L','https://www.cubeskills.com/tutorials/f2l'],['CubeSkills · 二步顶层','https://www.cubeskills.com/tutorials/2-look-last-layer']],lessons:[
  {title:'Cross · 直接拼底面十字',purpose:'把四条白棱直接放到底面，侧色对齐中心，减少先做小花的绕路。',steps:['先找一条白棱，看它的侧色属于哪个中心。规划把它送到底面的位置。','能在侧面直接对齐就送到底面；位置被占时，先移开，再放回。逐条加入，不破坏已经对齐的棱。','先练看好一条再转，熟练后尝试提前看两条。下面的五步只是这一局的路线，不是通用十字公式。'],check:'底面白十字，四条棱的侧色对齐各自中心。',alg:crossAlgorithm,setup:crossSetup,sample:crossSample,diagram:'cross'},
  {title:'F2L · 角和棱一起入槽',purpose:'把白角与它旁边的中层棱组成一对，一次放好两块。',steps:['找一个白角，再找不含黄色、另外两色与它相同的棱。它们属于同一个槽。','先把两块带到顶层，在空槽上方分开或配对。看下面的例子：这一对已经连好，目标槽在右前方。','用 U 把配好的角棱移到槽口，再插入。换下一槽重复；先理解配对，再查 41 个 F2L 局面。'],check:'四对都入槽，前两层完成，底面十字保留。',alg:"U R U' R'",diagram:'pair',group:'F2L'},
  {title:'OLL · 让整个顶面同色',purpose:'前两层完成后，只翻顶层的朝向，不要求侧面顶排归位。',steps:['开始仍用基础教程的造十字公式和小鱼公式：先翻黄棱，再翻黄角。','做完一次先重新摆好。下面是黄十字已好、可用一次小鱼翻满顶面的例子。','熟练后学二步 OLL，再逐渐认识完整 OLL 的 57 个图案；按图案选公式。'],check:'顶面全黄，前两层仍完整。',alg:algorithms.fish1,diagram:'top',group:'OLL'},
  {title:'PLL · 一次调整顶层位置',purpose:'顶面全黄后，通过一条置换公式同时调整需要交换的角与棱。',steps:['先看侧面顶排的同色条、眼睛和已经完整的面，识别谁需要交换。','下面是 T 置换：按图摆放后，完整做一次公式。其他局面去 PLL 图鉴查对应公式。','做完再用 U / U′ / U2 对齐中心。初学先用基础教程的分步换角、换棱，之后逐步学 21 类 PLL。'],check:'六个面都同色；必要时最后对齐顶层。',alg:algorithms.eyes,diagram:'pll',group:'PLL'}
 ]},
 roux:{title:'Roux · 先拼两个小积木',intro:'换一种思路：先拼左右两个 1×2×3 块，再处理顶层角与最后六条棱。先学造块，最后再练 M 中层的转法；下面都是独立的小练习。',sources:[['Roux Tutorial · 第一块','https://tutorial.rouxers.com/beginners/first-block.html'],['Roux Reader · 最后十块','https://book.rouxers.com/l10p.html']],lessons:[
  {title:'第一块 · 左侧 1×2×3',purpose:'先拼左侧下面两排的小积木，而不是整圈白十字。',steps:['左面朝左，白色朝下。先把左下棱与左面中心连起来。','把左前、左后各自的角棱配成对，接到这条棱旁，凑齐左面下面两排。','看左、前、后、底四面的连接颜色是否对齐。下面只演示最后一对的插入，完整造块要先把其余块拼好。'],check:'左侧下面两排和相邻底、前、后的贴纸组成一个正确的块。',alg:"L' U' L",diagram:'left-block'},
  {title:'第二块 · 右侧 1×2×3',purpose:'保留左块，在右侧拼一个相同大小的块。',steps:['尽量用右面 R、顶层 U 和中层 M 找块，先对齐右下棱，再接上两对角棱。','已拼好的左块不拆开。下面的右侧插入样例可以对照左块是否保持完整。','左右两块完成后，中间纵切片和顶层可以暂时乱着。'],check:'左右两个块都正确；中间暂时不必拼好。',alg:"R U R'",diagram:'right-block'},
  {title:'CMLL · 四个顶层角归位',purpose:'把顶层四个角翻正、换到正确位置，保留左右两个块。',steps:['只看顶层角的朝向和侧色。顶层的棱、中层的棱先不管。','先用基础教程的小鱼翻角，再用换角公式归位，检查左右两块是否保持。下面演示一个换角例子。','熟练后在 CMLL 图鉴学习一步处理四个角的对应公式。'],check:'四个顶层角与左右块对齐；剩下的只有六条棱和中层中心。',alg:algorithms.eyes,diagram:'pll',group:'CMLL'},
  {title:'LSE · 用 M、U 收尾',purpose:'只转中间纵层 M 与顶层 U，处理最后六条棱。',steps:['先学 M 的方向：从左面看，M 与 L 同方向；M2 就是中间纵层转半圈。','按顺序处理：六棱朝向 → 左右顶棱归位 → 中间四棱归位。中层中心也要最终对齐。','下面是左右顶棱已好时，中间四棱的一个收尾样例。它不是所有 LSE 局面的通用公式；用演示看懂 M、U 怎样保留两块。'],check:'六面同色，中层中心也回到对应颜色。',alg:'M2 U2 M2 U2',diagram:'middle-edges'}
 ]}
};

export const advancedSample=entry=>entry.sample?entry.sample():sampleFor(entry.alg);
export function advancedDiagram(entry){
 const state=advancedSample(entry);
 if(entry.diagram==='top')return topView(state,{sideHints:true});
 if(entry.diagram==='pll')return pllDiagram(state,'advanced-'+(entry.group||'pll'));
 const names=entry.diagram==='left-block'?['L','F','D']:entry.diagram==='right-block'?['R','F','D']:entry.diagram==='middle-edges'?['U','F','D']:entry.diagram==='cross'?['D','F','R']:['U','F','R'];
 return `<svg viewBox="0 0 270 105" role="img" aria-label="${entry.title}的练习局面">${names.map((name,i)=>faceGrid(state,name,8+i*90,8,25)+`<text x="${44+i*90}" y="99" text-anchor="middle" font-size="11" fill="#758969">${{U:'顶',D:'底',L:'左',R:'右',F:'前'}[name]} ${name}</text>`).join('')}</svg>`;
}
