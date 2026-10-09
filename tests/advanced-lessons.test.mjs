import assert from 'node:assert/strict';
import {apply,parseAlg,faces} from '../src/cube.js';
import {layerScores} from '../src/layer-match.js';
import {advancedCourses,advancedSample,advancedDiagram} from '../src/advanced-lessons.js';
const color=new Map(faces.map(([normal,c])=>[normal.join(','),c]));
const solved=state=>state.every(s=>s.c===color.get(s.n.join(',')));
const block=(state,side)=>state.filter(s=>s.p[0]===side&&s.p[1]<=0).every(s=>s.c===color.get(s.n.join(',')));
for(const [method,course]of Object.entries(advancedCourses))for(const [index,entry]of course.lessons.entries()){
 const initial=advancedSample(entry),end=apply(structuredClone(initial),parseAlg(entry.alg));
 assert.ok(!solved(initial),method+' '+index+' needs an unfinished example');
 assert.ok(advancedDiagram(entry).includes('<svg'));
 if(method==='cfop'){
  const before=layerScores(initial),after=layerScores(end);
  if(index===0){assert.ok(before[0]<4);assert.equal(after[0],4);assert.ok(!solved(end),'Cross example should leave further steps');}
  if(index===1){assert.deepEqual(before.slice(0,3),[4,3,3]);assert.ok(after.slice(0,3).every(n=>n===4));}
  if(index===2){assert.ok(before.slice(0,4).every(n=>n===4));assert.ok(before[4]<4);assert.ok(after.slice(0,5).every(n=>n===4));}
  if(index===3){assert.ok(before.slice(0,5).every(n=>n===4));assert.ok(solved(end));}
 }else{
  if(index===0){assert.ok(!block(initial,-1));assert.ok(block(end,-1));}
  if(index===1){assert.ok(block(initial,-1));assert.ok(!block(initial,1));assert.ok(block(end,-1)&&block(end,1));}
  if(index>=2){assert.ok(block(initial,-1)&&block(initial,1));assert.ok(block(end,-1)&&block(end,1));assert.ok(layerScores(end).slice(4,6).every(n=>n===4));}
  if(index===3){assert.ok(layerScores(initial).slice(4,6).every(n=>n===4));assert.ok(parseAlg(entry.alg).every(t=>'MU'.includes(t[0])));assert.ok(solved(end));}
 }
}
console.log('Verified every CFOP and Roux example goal, CFOP stage prerequisites, preserved Roux blocks, and M/U-only LSE finish.');
