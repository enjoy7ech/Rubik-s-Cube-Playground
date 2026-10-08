import fs from 'node:fs';
import {createCube,apply,parseAlg,inverse} from './dist/cube.js';
import {whiteCrossAlgorithm,whiteCrossInitial} from './dist/white-cross-lesson.js';
const source=fs.readFileSync('dist/lessons.js','utf8'),literal=source.slice(source.indexOf('const courses=')+14,source.indexOf('\nfunction showCourse')).trim().replace(/;$/,'');
const courses=Function('whiteCrossAlgorithm','return ('+literal+')')(whiteCrossAlgorithm),colors=new Map(createCube().map(s=>[s.n.join(','),s.c]));
for(const [key,course]of Object.entries(courses))for(const [i,[title,,alg]]of course.lessons.entries()){
 const isCross=key==='beginner'&&i===0,start=isCross?structuredClone(whiteCrossInitial):apply(createCube(),inverse(parseAlg(alg))),end=apply(structuredClone(start),parseAlg(alg));
 if(!(isCross?end.filter(s=>s.p[1]===-1&&s.p.filter(v=>v!==0).length===2):end).every(s=>s.c===colors.get(s.n.join(','))))throw Error('Example fails '+title);
 const cross=start.filter(s=>s.p[1]===-1&&s.p.filter(v=>v!==0).length===2).every(s=>s.c===colors.get(s.n.join(',')));
 const layer1=start.filter(s=>s.p[1]===-1).every(s=>s.c===colors.get(s.n.join(',')));
 const layer2=start.filter(s=>s.p[1]<1).every(s=>s.c===colors.get(s.n.join(',')));
 if(key==='beginner'&&((i===1&&!cross)||(i===2&&!layer1)||(i>=3&&!layer2)))throw Error('Wrong initial layer '+title);
 if(key==='beginner'&&i===5){if(!start.filter(s=>s.n[1]===1&&s.p.filter(v=>v!==0).length===2).every(s=>s.c===0))throw Error('Wrong yellow cross');const pieces=new Map();for(const s of start)if(s.p[1]===1&&s.p.filter(v=>v!==0).length===3){const k=s.p.join(',');if(!pieces.has(k))pieces.set(k,[]);pieces.get(k).push(s)}if(![...pieces.values()].every(p=>p.map(s=>s.c).sort().join(',')===p.map(s=>colors.get(s.n.join(','))).sort().join(',')))throw Error('Wrong corner placement')}
 console.log('Verified',title,parseAlg(alg).length,'moves');
 if(key==='beginner'&&i===4){const p=[1,1,1],corner=start.filter(s=>s.p.join(',')===p.join(','));console.log('Fixed upper front right corner:',corner.map(s=>s.c).sort().join(',')===corner.map(s=>colors.get(s.n.join(','))).sort().join(','))}
}
