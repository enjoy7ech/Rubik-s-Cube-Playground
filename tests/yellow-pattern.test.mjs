import assert from 'node:assert/strict';
import {apply,parseAlg} from '../src/cube.js';
import {walkthrough} from '../src/tutorial-walkthrough.js';
import {yellowPattern,yellowCrossStep} from '../src/beginner-teaching.js';
import {layerScores} from '../src/layer-match.js';
const formula=parseAlg("F R U R' U' F'"),expected=['dot','L','line','cross'];
let state=structuredClone(walkthrough[3].initial);
for(let i=0;i<3;i++){
 assert.equal(yellowPattern(state),expected[i]);
 for(const setup of [[],['U'],["U'"],['U2']]){
  const trial=apply(structuredClone(state),setup),instruction=yellowCrossStep(trial);
  apply(trial,[...instruction.preparation,...formula]);
  assert.equal(yellowPattern(trial),expected[i+1]);assert.ok(layerScores(trial).slice(0,3).every(n=>n===4));
 }
 const instruction=yellowCrossStep(state);apply(state,[...instruction.preparation,...formula]);
}
assert.equal(yellowPattern(state),'cross');
console.log('Verified dot → upper-left L → horizontal line → cross for every top rotation, with first two layers preserved.');
