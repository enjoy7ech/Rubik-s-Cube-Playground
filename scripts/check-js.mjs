import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files=fs.readdirSync(path.join(root,'src')).filter(name=>name.endsWith('.js')).sort();
for(const name of files){const result=spawnSync(process.execPath,['--check',path.join(root,'src',name)],{stdio:'inherit'});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status??1)}
console.log(`Syntax checked ${files.length} application scripts.`);
