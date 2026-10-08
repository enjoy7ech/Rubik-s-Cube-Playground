import {cpSync, rmSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
rmSync(output, {recursive: true, force: true});
cpSync(path.join(root, 'src'), output, {recursive: true});
function list(directory, prefix = '') {
  return readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    const relative = prefix + entry.name;
    return entry.isDirectory() ? list(path.join(directory, entry.name), relative + '/') : [relative];
  });
}
const assets = list(output).filter(name => name !== 'sw.js').sort();
const hash = createHash('sha256');
for (const asset of [...assets, 'sw.js']) hash.update(asset).update(readFileSync(path.join(output, asset)));
const version = hash.digest('hex').slice(0, 16);
const worker = readFileSync(path.join(output, 'sw.js'), 'utf8')
  .replace('__BUILD_VERSION__', version)
  .replace('const ASSETS = []; // BUILD_ASSETS', `const ASSETS = ${JSON.stringify(assets)};`);
writeFileSync(path.join(output, 'sw.js'), worker);
console.log('Built static site: dist/');
