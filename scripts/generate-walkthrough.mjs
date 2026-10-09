import fs from 'node:fs';
import {apply,parseAlg,move} from '../src/cube.js';
import {guideNext,stageNames} from '../src/beginner-guide.js';
import {layerScores} from '../src/layer-match.js';
import {whiteCrossInitial,whiteCrossAlgorithm,whiteCrossNotes} from '../src/white-cross-lesson.js';
let state=structuredClone(whiteCrossInitial);const chapters=[];
const describe=token=>({R:'右面',L:'左面',U:'顶面',D:'底面',F:'前面',B:'后面',x:'整个魔方',y:'整个魔方',z:'整个魔方'})[token[0]]+(token.includes('2')?'转半圈':token.includes("'")?'逆时针转':'顺时针转');
for(let stage=0;stage<7;stage++){
 const initial=structuredClone(state),tokens=[],notes=[stageNames[stage]+'：先观察图形，摆好方向，再做基础公式。'];
 if(stage===0){tokens.push(...parseAlg(whiteCrossAlgorithm));apply(state,tokens);notes.splice(0,notes.length,...whiteCrossNotes)}
 else for(let round=0;layerScores(state)[stage]<4&&round<12;round++){
  const match=await guideNext(state);if(match.stage!==stage)throw Error('Sample skipped stage '+stage);
  for(const part of match.results[0].parts){
   for(let i=0;i<part.tokens.length;i++){const token=part.tokens[i];tokens.push(token);move(state,token);notes.push(i<part.preparation.length?'摆放方向：'+describe(token)+'。':`第 ${round+1} 轮：${describe(token)}。`)}
   notes[notes.length-1]=part.note||'这一轮做完，重新观察形态和位置。';
  }
 }
 if(layerScores(state)[stage]!==4)throw Error('Stage did not complete '+stage);
 if(!tokens.length)throw Error('Choose a sample that actually teaches every stage: '+stage);
 if(stage<3&&layerScores(state)[3]===4)throw Error('Sample accidentally finished the yellow cross early');
 chapters.push({initial,alg:tokens.join(' '),notes,final:structuredClone(state)});console.log(stageNames[stage],tokens.length,'moves',layerScores(state));
}
if(!layerScores(state).every(n=>n===4))throw Error('Not solved');
fs.writeFileSync('src/tutorial-walkthrough.js','export const walkthrough='+JSON.stringify(chapters)+';\n');
console.log('Verified the new seven-stage fish/headlights method from one scramble to solved.');
