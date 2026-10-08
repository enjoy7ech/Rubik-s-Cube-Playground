import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const tasks={
  test:['tests/cube.test.mjs','tests/white-cross.test.mjs','tests/walkthrough.test.mjs','tests/middle-diagram.test.mjs','tests/pwa.test.mjs'],
  generate:['scripts/generate-walkthrough.mjs','scripts/generate-cfop-cross.mjs']
};
const scripts=tasks[process.argv[2]];
if(!scripts)throw Error('Usage: node scripts/tasks.mjs test|generate');
for(const script of scripts){const result=spawnSync(process.execPath,[path.join(root,script)],{cwd:root,stdio:'inherit'});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status??1)}
