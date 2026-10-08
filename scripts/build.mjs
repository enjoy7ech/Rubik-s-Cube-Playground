import {cpSync, rmSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
rmSync(output, {recursive: true, force: true});
cpSync(path.join(root, 'src'), output, {recursive: true});
console.log('Built static site: dist/');
