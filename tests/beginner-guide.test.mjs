import assert from 'node:assert/strict';
import {createCube,apply,parseAlg} from '../src/cube.js';
import {guideNext,fixedFormulas} from '../src/beginner-guide.js';
import {layerScores} from '../src/layer-match.js';
import {walkthrough} from '../src/tutorial-walkthrough.js';
let seed=271828;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32};
const varied=Array.from({length:8},(_,i)=>{let previous='',tokens=[];for(let j=0;j<24;j++){let face;do{face='RLUDFB'[Math.floor(random()*6)]}while(face===previous);previous=face;tokens.push(face+['',"'",'2'][Math.floor(random()*3)])}return['seeded '+i,tokens.join(' ')]});
for(const [sample,setup] of [
 ['tutorial',null],
 ['mixed A',"R U F2 L' D B R2 U' L F D2 B' R U2 F' L2 B D' R' U"],
 ['mixed B',"F R' U2 B L D' R2 F' U L2 B' D F2 R U' B2 L' D2 R' F"],
 ['mixed C',"L2 U' F R D2 B' U2 R' F2 L D B2 R U L' F' D' R2 B U"],...varied
]){
 let state=setup?apply(createCube(),parseAlg(setup)):structuredClone(walkthrough[0].initial),steps=0;
 for(;steps<30;steps++){
  const match=await guideNext(state);if(match.stage===7)break;
  const result=match.results[0];assert.equal(result.formula,fixedFormulas[match.stage]);
  for(const part of result.parts)if(match.stage>0&&part.formula)assert.equal(part.formula,result.formula);
  state=apply(state,parseAlg(result.alg));
  assert.deepEqual(layerScores(state),result.after);
 }
 assert.ok(steps<30,sample+' should complete');assert.ok(layerScores(state).every(n=>n===4));
}
for(const base of ['U','F','B','R','L']){
 const state=apply(createCube(),parseAlg("R U F L' B2 D")),match=await guideNext(state,base),after=apply(structuredClone(state),parseAlg(match.results[0].alg));
 assert.equal(layerScores(after)[0],4,base+' becomes the solved bottom cross');
}
console.log('Verified fixed formulas complete varied scrambles and support every starting face.');
