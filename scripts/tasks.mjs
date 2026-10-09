import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const tasks={
  test:['tests/cube.test.mjs','tests/white-cross.test.mjs','tests/walkthrough.test.mjs','tests/pwa.test.mjs','tests/scene-framing.test.mjs','tests/beginner-guide.test.mjs','tests/yellow-pattern.test.mjs','tests/tutorial-method.test.mjs','tests/advanced-lessons.test.mjs','tests/corner-method.test.mjs','tests/view-frame.test.mjs'],
  generate:['scripts/generate-walkthrough.mjs']
};
const scripts=tasks[process.argv[2]];
if(!scripts)throw Error('Usage: node scripts/tasks.mjs test|generate');
for(const script of scripts){const result=spawnSync(process.execPath,[path.join(root,script)],{cwd:root,stdio:'inherit'});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status??1)}
