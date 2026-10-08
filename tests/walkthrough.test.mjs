import {walkthrough} from '../src/tutorial-walkthrough.js';
import {apply,parseAlg,createCube} from '../src/cube.js';
import {layerScores} from '../src/layer-match.js';
const colors=new Map(createCube().map(s=>[s.n.join(','),s.c]));
for(const [i,chapter]of walkthrough.entries()){
 const end=apply(structuredClone(chapter.initial),parseAlg(chapter.alg));
 if(JSON.stringify(end)!==JSON.stringify(chapter.final))throw Error('Wrong end '+i);
 if(i&&JSON.stringify(chapter.initial)!==JSON.stringify(walkthrough[i-1].final))throw Error('Discontinuity '+i);
 if(chapter.notes.length!==parseAlg(chapter.alg).length+1)throw Error('Missing step explanation '+i);
 const s=layerScores(end),checks=[[0],[0,1],[0,1,2],[0,1,2,3],[0,1,2,3,5],[0,1,2,3,4,5],[0,1,2,3,4,5,6]][i];
 if(!checks.every(j=>s[j]===4))throw Error('Wrong stage goal '+i);
 if(i<3&&s[3]===4)throw Error('Yellow cross should remain unfinished before its own lesson');
 if(i===3&&(s[4]===4||s[5]===4))throw Error('Yellow-cross example must leave corner orientation and placement for later lessons');
 if(i===4&&s[4]===4)throw Error('Corner orientation lesson needs corners that are not yet yellow-up');
 if(!parseAlg(chapter.alg).length)throw Error('Every lesson needs an actual operation');
 console.log('Chapter',i+1,'continuous start, every move explained, stage goal verified');
}
if(!walkthrough.at(-1).final.every(s=>s.c===colors.get(s.n.join(','))))throw Error('Not solved');
