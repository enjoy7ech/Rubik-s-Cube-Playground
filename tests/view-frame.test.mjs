import assert from 'node:assert/strict';
import {viewFrame,frameKey,viewToken,stateInView} from '../src/view-frame.js';
import {createCube,apply,parseAlg} from '../src/cube.js';
import {guideNext} from '../src/beginner-guide.js';
import {layerScores} from '../src/layer-match.js';
const normals=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],dot=(a,b)=>a.reduce((n,x,i)=>n+x*b[i],0);
const state=apply(createCube(),parseAlg("R U F2 L' B D2")),key=s=>s.map(t=>[...t.p,...t.n,t.c].join(',')).sort().join(';'),frames=new Set();
for(const front of normals)for(const up of normals){if(dot(front,up)!==0)continue;
 const frame=viewFrame(front,up);frames.add(frameKey(frame));assert.deepEqual(frame.F,front);assert.deepEqual(frame.U,up);
 for(const token of ['R',"L'",'U2',"D'",'F',"B'",'Rw',"l'",'2R','M',"E'",'S2','x',"y'",'z2']){
  const actual=viewToken(token,frame,true);assert.equal(viewToken(actual,frame),token);
  const expected=apply(stateInView(state,frame),[token]);
  assert.equal(key(stateInView(apply(structuredClone(state),[actual]),frame)),key(expected),token+' maps to the same visible layer and direction');
 }
}
assert.equal(frames.size,24);
const front=viewFrame([0,0,1],[0,1,0]),back=viewFrame([0,0,-1],[0,1,0]);
assert.equal(viewToken('F',back,true),'B');assert.equal(viewToken('R',back,true),'L');assert.equal(viewToken('U',back,true),'U');
const guide=await guideNext(stateInView(state,back)),applied=apply(structuredClone(state),parseAlg(guide.results[0].alg).map(t=>viewToken(t,back,true)));
assert.equal(layerScores(stateInView(applied,back))[0],4,'the assistant applies its visible-frame solution to the real cube');
assert.equal(frameKey(viewFrame([.71,0,.70],[0,1,0],front)),frameKey(front),'small diagonal movement does not flicker labels');
console.log('Verified all 24 viewing frames, face/slice/whole-cube turn mappings, back-view controls, and stable labels near diagonals.');
