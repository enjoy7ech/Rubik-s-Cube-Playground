import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCube,apply,parseAlg} from '../src/cube.js';
import {algorithms,lessons} from '../src/tutorial-content.js';
import {sampleFor,pllDiagram,normalizePll} from '../src/tutorial-diagrams.js';
import {yellowPattern} from '../src/beginner-teaching.js';
import {guideNext,fixedFormulas} from '../src/beginner-guide.js';
import {layerScores} from '../src/layer-match.js';
const upCorners=s=>s.filter(t=>t.c===0&&t.n[1]===1&&Math.abs(t.p[0])+Math.abs(t.p[2])===2);
const a=sampleFor(algorithms.fish1),b=sampleFor(algorithms.fish2);
assert.deepEqual(upCorners(a).map(s=>s.p),[[-1,1,1]]);assert.deepEqual(upCorners(b).map(s=>s.p),[[1,1,-1]]);
for(const [state,formula]of [[a,algorithms.fish1],[b,algorithms.fish2]])assert.equal(layerScores(apply(structuredClone(state),parseAlg(formula)))[4],4);
const corners=sampleFor(algorithms.eyes),edges=sampleFor(algorithms.edges);
const tile=(s,p,n)=>s.find(t=>t.p.join(',')===p.join(',')&&t.n.join(',')===n.join(',')).c;
const cornerExample=lessons[1].cases[0].sample();assert.ok(cornerExample.some(s=>s.c===1&&s.p.join(',')==='1,1,1'));assert.equal(layerScores(cornerExample)[0],4);
for(const [index,sideColor]of [[0,2],[1,3]]){const example=lessons[2].cases[index].sample();assert.equal(tile(example,[0,1,1],[0,0,1]),4);assert.equal(tile(example,[0,1,1],[0,1,0]),sideColor);assert.ok(layerScores(example).slice(0,2).every(n=>n===4))}
assert.equal(tile(corners,[-1,1,-1],[-1,0,0]),tile(corners,[-1,1,1],[-1,0,0]));
assert.ok(edges.filter(t=>t.n[2]===-1).every(t=>t.c===5));assert.ok(edges.filter(t=>t.n[2]===1).some(t=>t.c!==4));
assert.equal(yellowPattern(lessons[3].cases[0].sample()),'dot');assert.equal(yellowPattern(lessons[3].cases[1].sample()),'L');assert.equal(yellowPattern(lessons[3].cases[2].sample()),'line');
assert.ok([0,2].includes(upCorners(lessons[4].cases[2].sample()).length));
assert.equal(fixedFormulas[4],algorithms.fish1);assert.equal(fixedFormulas[5],algorithms.eyes);assert.equal(fixedFormulas[6],algorithms.edges);
const key=s=>s.filter(t=>t.c===0&&t.p[1]===1&&Math.abs(t.p[0])+Math.abs(t.p[2])===2).map(t=>[...t.p,...t.n].join(',')).sort().join(';');
const queue=[createCube()],seen=new Set([key(queue[0])]);for(let i=0;i<queue.length;i++)for(const alg of ['U',algorithms.fish1,algorithms.fish2]){const state=apply(structuredClone(queue[i]),parseAlg(alg)),hash=key(state);if(!seen.has(hash)){seen.add(hash);queue.push(state)}}
assert.equal(queue.length,27);for(const original of queue){let state=structuredClone(original);for(let i=0;layerScores(state)[4]<4&&i<3;i++){const guide=await guideNext(state);assert.equal(guide.stage,4);assert.equal(guide.results[0].formula,algorithms.fish1);assert.equal(guide.results[0].parts.filter(part=>part.formula).length,1);state=apply(state,parseAlg(guide.results[0].alg));assert.ok(layerScores(state).slice(0,4).every(n=>n===4))}assert.equal(layerScores(state)[4],4)}
const pll=JSON.parse(fs.readFileSync('src/algs.json','utf8')).filter(d=>d.group==='PLL');assert.equal(pll.length,21);for(const [i,entry]of pll.entries()){const {state,alg}=normalizePll(entry.algs[0]);assert.ok(layerScores(state).slice(0,5).every(n=>n===4));if(['Aa','Ab','Ua','Ub'].includes(entry.name))assert.equal(layerScores(state)[5]+layerScores(state)[6],5,entry.name+' should show only the three-piece cycle');assert.ok(pllDiagram(state,'test'+i).includes('<line'));assert.ok(layerScores(apply(state,parseAlg(alg))).every(n=>n===4))}
console.log('Verified one fixed Sune solves all 27 corner orientations in at most three rounds; teaching examples, left headlights, back fixed face and 21 PLL diagrams.');
