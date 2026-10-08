import {createCube,apply,parseAlg,move} from '../src/cube.js';
import {whiteCrossInitial,whiteCrossMoves,whiteCrossCheckpoints} from '../src/white-cross-lesson.js';
const state=structuredClone(whiteCrossInitial),petals=s=>s.filter(t=>t.c===1&&t.n[1]===1&&t.p.filter(v=>v!==0).length===2).length;
if(petals(state)!==0)throw Error('Example already has petals');
for(let i=0;i<whiteCrossMoves.length;i++){
 move(state,whiteCrossMoves[i]);if(i<4&&petals(state)!==i+1)throw Error('Petal lost');
 for(const check of whiteCrossCheckpoints.filter(c=>c.index===i+1)){
  if(check.type==='daisy'){
   if(petals(state)!==4)throw Error('Not a daisy');
   if(state.some(t=>t.c===1&&t.n[1]===-1&&t.p.filter(v=>v!==0).length===2))throw Error('White edges cannot be on both U and D in the daisy example');
  }
  if(check.type==='aligned'){const p=[check.normal[0],1,check.normal[2]];if(!state.some(t=>t.p.join(',')===p.join(',')&&t.n.join(',')===check.normal.join(',')&&t.c===check.sideColor))throw Error('Side not aligned')}
  if(check.type==='sent'){const whites=state.filter(t=>t.c===1&&t.n[1]===-1&&t.p.filter(v=>v!==0).length===2);if(whites.length!==check.count)throw Error('Lost sent edge')}
 }
}
const expected=new Map(createCube().map(s=>[s.n.join(','),s.c]));
if(!state.filter(t=>t.p[1]===-1&&t.p.filter(v=>v!==0).length===2).every(t=>t.c===expected.get(t.n.join(','))))throw Error('Cross sides do not match');
if(state.filter(t=>t.c===0&&t.n[1]===1&&t.p.filter(v=>v!==0).length===2).length===4)throw Error('Teaching example must not accidentally complete the yellow cross with the white cross');
console.log('Verified: 0 → 4 white petals, every side alignment, 1 → 4 bottom edges, and all four side colors.');
