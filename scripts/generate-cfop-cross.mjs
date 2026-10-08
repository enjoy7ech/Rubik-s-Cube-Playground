import fs from 'node:fs';
import {whiteCrossInitial} from '../src/white-cross-lesson.js';
import {crossSteps} from '../src/cross-guide.js';
import {apply,parseAlg} from '../src/cube.js';
import {layerScores} from '../src/layer-match.js';
const alg=(await crossSteps(whiteCrossInitial)).join(' '),final=apply(structuredClone(whiteCrossInitial),parseAlg(alg));
if(layerScores(final)[0]!==4)throw Error('Cross not complete');
fs.writeFileSync('src/cfop-cross-example.js','export const cfopCross='+JSON.stringify({initial:whiteCrossInitial,alg})+';\n');console.log('Verified direct CFOP cross example',alg);
