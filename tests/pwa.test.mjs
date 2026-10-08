import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import vm from 'node:vm';
const manifest=JSON.parse(readFileSync('src/manifest.webmanifest','utf8'));
for(const icon of manifest.icons){const bytes=readFileSync('src/'+icon.src),size=icon.sizes.split('x').map(Number);assert.equal(bytes.readUInt32BE(16),size[0]);assert.equal(bytes.readUInt32BE(20),size[1])}
for(const page of ['index','library','tutorials']){const html=readFileSync('src/'+page+'.html','utf8');assert.ok(html.includes('rel="manifest"'));assert.ok(html.includes('src="pwa.js"'))}
const assets=readdirSync('src',{recursive:true,withFileTypes:true}).filter(file=>file.isFile()).map(file=>file.name);
assert.ok(assets.includes('three.module.js'));
const handlers={},stores=new Map();let claimed=false,skipped=false;
const caches={async keys(){return [...stores.keys()]},async delete(key){return stores.delete(key)},async open(key){if(!stores.has(key))stores.set(key,new Map());const store=stores.get(key);return{async addAll(urls){for(const url of urls)store.set(url,{url,ok:true})},async match(url){return store.get(url)}}}};
const self={location:{href:'https://example.test/cube/sw.js'},clients:{async claim(){claimed=true}},skipWaiting(){skipped=true},addEventListener(type,handler){handlers[type]=handler}};
const source=readFileSync('src/sw.js','utf8').replace('__BUILD_VERSION__','test').replace('const ASSETS = []; // BUILD_ASSETS','const ASSETS = ["index.html","tutorials.html","library.html","cube.js"];');
vm.runInNewContext(source,{self,caches,URL,fetch:()=>{throw Error('offline')}});
let pending;handlers.install({waitUntil(promise){pending=promise}});await pending;assert.equal(skipped,false);
async function request(path){let response;handlers.fetch({request:{method:'GET',url:'https://example.test'+path},respondWith(promise){response=promise}});return response?await response:null}
assert.equal((await request('/cube/')).url,'https://example.test/cube/index.html');
assert.equal((await request('/cube/index.html?alg=R%20U&setup=1')).url,'https://example.test/cube/index.html');
assert.equal((await request('/cube/library?handbook=1')).url,'https://example.test/cube/library.html');
assert.equal((await request('/cube/tutorials')).url,'https://example.test/cube/tutorials.html');
assert.equal((await request('/cube/cube.js')).url,'https://example.test/cube/cube.js');
assert.equal(await request('/cube/missing.js'),null);
assert.equal(await request('/other/index.html'),null);
stores.set('fangcun-static-old',new Map());stores.set('unrelated',new Map());
handlers.activate({waitUntil(promise){pending=promise}});await pending;
assert.equal(stores.has('fangcun-static-old'),false);assert.ok(stores.has('unrelated'));assert.ok(claimed);
handlers.message({data:{type:'ACTIVATE_UPDATE'}});assert.ok(skipped);
console.log('Verified PWA icons, page integration, offline routes with query strings, scoped cache cleanup and explicit update activation.');
