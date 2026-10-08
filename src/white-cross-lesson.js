import {createCube,apply,parseAlg,move} from './cube.js';

// A legal example with no initial petals and an unfinished yellow cross after D is solved.
export const whiteCrossSetup="F R U R' U' F' R U' R U R U R U' R' U' R2 F2 R2 B2 L2 U F R B L";
export const whiteCrossInitial=apply(createCube(),parseAlg(whiteCrossSetup));
const state=structuredClone(whiteCrossInitial);
export const whiteCrossMoves=["L'","B'","R'","F'"];
export const whiteCrossNotes=[
 '① 找白色棱块：此时顶面还没有白色花瓣。保持黄色中心在上方，先把白色棱块移到它周围。',
 '小花 1 / 4：转左面，把第一条白色棱块的白色面送到顶面。',
 '小花 2 / 4：转后面，把第二条白棱送到顶面，保留已有花瓣。',
 '小花 3 / 4：转右面，把第三条白棱送到顶面。',
 '小花 4 / 4：转前面，黄色中心周围有四片白色花瓣。现在开始把它们送到底面。'
];
apply(state,whiteCrossMoves);
const specs=[['F',[0,0,1],'绿色'],['R',[1,0,0],'粉色'],['B',[0,0,-1],'蓝色'],['L',[-1,0,0],'橙色']];
export const whiteCrossCheckpoints=[{index:4,type:'daisy'}];
for(const [face,normal,color]of specs){
 const position=[normal[0],1,normal[2]],sideColor=state.find(s=>s.n.join(',')===normal.join(',')&&s.p.filter(v=>v!==0).length===1).c;
 const fits=s=>s.some(t=>t.p.join(',')===position.join(',')&&t.n[1]===1&&t.c===1)&&s.some(t=>t.p.join(',')===position.join(',')&&t.n.join(',')===normal.join(',')&&t.c===sideColor);
 const setup=[[],['U'],['U2'],["U'"]].find(tokens=>fits(apply(structuredClone(state),tokens)));
 if(!setup)throw Error('White petal cannot be aligned');
 for(const token of setup){whiteCrossMoves.push(token);move(state,token);whiteCrossNotes.push('② 对齐侧色：只转顶层，让这片白花瓣的'+color+'侧面与'+color+'中心对齐。白色花瓣仍朝上。')}
 whiteCrossCheckpoints.push({index:whiteCrossMoves.length,type:'aligned',normal,sideColor});
 whiteCrossMoves.push(face+'2');move(state,face+'2');
 const count=state.filter(s=>s.c===1&&s.n[1]===-1&&s.p.filter(v=>v!==0).length===2).length;
 whiteCrossNotes.push('③ 送到底面 '+count+' / 4：'+color+'侧色已对齐中心，把这一面转半圈。'+(count===4?'底面白十字和四个侧色已对齐。顶面的黄十字还没完成，这一步先不用管。翻看底面检查。':'对其余白色花瓣重复“对齐侧色 → 转半圈”。'));
 whiteCrossCheckpoints.push({index:whiteCrossMoves.length,type:'sent',count});
}
export const whiteCrossAlgorithm=whiteCrossMoves.join(' ');
