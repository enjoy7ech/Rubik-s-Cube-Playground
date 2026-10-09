import assert from 'node:assert/strict';
import {createCube,apply,parseAlg} from '../src/cube.js';
import {layerScores} from '../src/layer-match.js';
import {algorithms,lessons} from '../src/tutorial-content.js';
import {guideNext} from '../src/beginner-guide.js';
import {cornerSetup} from '../src/beginner-teaching.js';
const cornerKey=s=>s.filter(t=>t.p[1]===1&&Math.abs(t.p[0])+Math.abs(t.p[2])===2).map(t=>[...t.p,...t.n,t.c].join(',')).sort().join(';');
const edgeKey=s=>s.filter(t=>t.p.filter(v=>v!==0).length===2).map(t=>[...t.p,...t.n,t.c].join(',')).sort().join(';');
const queue=[createCube()],seen=new Set([cornerKey(queue[0])]);
for(let i=0;i<queue.length;i++)for(const tokens of [['U'],parseAlg(algorithms.corners)]){const state=apply(structuredClone(queue[i]),tokens),hash=cornerKey(state);if(!seen.has(hash)){seen.add(hash);queue.push(state)}}
assert.equal(queue.length,24);assert.equal(parseAlg(algorithms.corners).length,9);
let longest=0;
for(const original of queue){let state=structuredClone(original),calls=0;
 for(;layerScores(state)[5]<4&&calls<4;calls++){
  const guide=await guideNext(state);assert.equal(guide.stage,5);
  for(const part of guide.results[0].parts){
   apply(state,part.preparation);
   if(part.formula){assert.equal(part.formula,algorithms.corners);assert.equal(part.repeats,1);const edges=edgeKey(state);apply(state,parseAlg(part.formula));assert.equal(edgeKey(state),edges);}
  }
  assert.ok(layerScores(state).slice(0,5).every(n=>n===4),'keep first two layers and yellow top');
 }
 assert.equal(layerScores(state)[5],4);longest=Math.max(longest,calls);
}
const fixed=lessons[5].cases[0].sample();assert.equal(layerScores(fixed)[5],1);assert.deepEqual(cornerSetup(fixed),{complete:false,preparation:[]});
assert.equal(cornerSetup(lessons[5].cases[1].sample()),null);
console.log('Verified all 24 corner permutations using one 9-move formula, at most '+longest+' rounds, with yellow top, first two layers and edges preserved.');
