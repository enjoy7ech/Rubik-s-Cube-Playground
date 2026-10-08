import {walkthrough} from '../dist/tutorial-walkthrough.js';
import {apply,parseAlg,createCube} from '../dist/cube.js';
import {layerScores} from '../dist/layer-match.js';
const colors=new Map(createCube().map(s=>[s.n.join(','),s.c]));
for(const [i,chapter]of walkthrough.entries()){
 const end=apply(structuredClone(chapter.initial),parseAlg(chapter.alg));
 if(JSON.stringify(end)!==JSON.stringify(chapter.final))throw Error('Wrong end '+i);
 if(i&&JSON.stringify(chapter.initial)!==JSON.stringify(walkthrough[i-1].final))throw Error('Discontinuity '+i);
 if(chapter.notes.length!==parseAlg(chapter.alg).length+1)throw Error('Missing step explanation '+i);
 const s=layerScores(end),checks=[[0],[0,1],[0,1,2],[0,1,2,3],[0,1,2,3,5],[0,1,2,3,4,5],[0,1,2,3,4,5,6]][i];
 if(!checks.every(j=>s[j]===4))throw Error('Wrong stage goal '+i);
 console.log('Chapter',i+1,'continuous start, every move explained, stage goal verified');
}
if(!walkthrough.at(-1).final.every(s=>s.c===colors.get(s.n.join(','))))throw Error('Not solved');
