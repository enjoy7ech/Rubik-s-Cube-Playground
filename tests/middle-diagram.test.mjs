import {walkthrough} from '../dist/tutorial-walkthrough.js';
import {apply,parseAlg} from '../dist/cube.js';
const before=walkthrough[2].initial,after=apply(structuredClone(before),parseAlg("U R U' R' U' F' U F"));
const tile=(s,p,n)=>s.find(t=>t.p.join(',')===p.join(',')&&t.n.join(',')===n.join(',')).c;
if(tile(before,[0,1,1],[0,1,0])!==2||tile(before,[0,1,1],[0,0,1])!==4)throw Error('Wrong green/pink source');
if(tile(after,[1,0,1],[1,0,0])!==2||tile(after,[1,0,1],[0,0,1])!==4)throw Error('Wrong target slot');
for(const s of before.filter(s=>s.p[1]===-1))if(tile(after,s.p,s.n)!==s.c)throw Error('First layer changed');
console.log('Diagram verified against the actual tutorial state: aligned green/pink edge moves to front-right middle; first layer preserved.');
