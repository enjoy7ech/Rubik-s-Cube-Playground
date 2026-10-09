import assert from 'node:assert/strict';
import {createCube,apply,parseAlg,inverse} from '../src/cube.js';
import {algorithms} from '../src/tutorial-content.js';
import {layerScores} from '../src/layer-match.js';
import {guideNext} from '../src/beginner-guide.js';
const key=s=>s.map(t=>[...t.p,...t.n,t.c].join(',')).sort().join(';');
const pair=parseAlg(algorithms.edges),solved=createCube(),changed=apply(structuredClone(solved),pair);
assert.deepEqual(layerScores(changed),[4,4,4,4,4,4,1]);
assert.ok(changed.filter(t=>t.n[2]===-1).every(t=>t.c===5),'the back face stays complete');
assert.equal(key(apply(structuredClone(changed),[...pair,...pair])),key(solved),'three full pairs restore the cube');
assert.equal(layerScores(apply(createCube(),parseAlg(algorithms.fish1+' '+algorithms.fishLeft)))[4],2,'the U bridge is necessary');
const queue=[solved],seen=new Set([key(solved)]);
const generators=[[],['y'],['y2'],["y'"]].map(yaw=>[...yaw,...pair,...inverse(yaw)]);
for(let i=0;i<queue.length;i++)for(const tokens of generators){const s=apply(structuredClone(queue[i]),tokens),hash=key(s);if(!seen.has(hash)){seen.add(hash);queue.push(s)}}
assert.equal(queue.length,12,'all legal last-layer edge permutations with corners solved');
for(const original of queue){
 let s=structuredClone(original);
 if(layerScores(s)[6]===4)continue;
 const result=await guideNext(s);assert.equal(result.stage,6);
 for(const part of result.results[0].parts){assert.equal(part.formula,algorithms.edges);apply(s,part.preparation);for(let repeat=0;repeat<part.repeats;repeat++){apply(s,pair);assert.ok(layerScores(s).slice(0,6).every(n=>n===4),'each complete pair keeps the top, corners and first two layers')}}
 assert.ok(layerScores(s).every(n=>n===4));
}
console.log('Verified double-fish solves all 12 last-layer edge permutations and preserves yellow top, corners and first two layers after each complete pair.');
