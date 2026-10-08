import fs from 'node:fs';
import {parseAlg} from './dist/cube.js';
const groups=['f2l','oll','pll','coll','cmll','2loll','2lpll','2aoll','2apll','4aoll','4apll','pbl','l2e','l3e','l4e'];
const output=[];
for(const group of groups){
 const res=await fetch(`https://raw.githubusercontent.com/Logiqx/cubing-algs/master/data/${group}.js`);
 if(!res.ok) throw Error(group);
 const src=await res.text();
 const data=JSON.parse(src.slice(src.indexOf('{'),src.lastIndexOf('}')+1).replace(/,\s*([}\]])/g,'$1'));
 for(const c of data.cases){
   const algs=c.algs?.map(a=>a.alg?.replace(/[’′]/g,"'")).filter(a=>{try{return !!a && parseAlg(a).length>0}catch{return false}})||[];
   if(algs.length)output.push({id:group+'-'+c.id,group:group.toUpperCase(),name:c.id,label:c.name||c.id,algs});
 }
 console.log(group, data.cases.length);
}
fs.writeFileSync('dist/algs.json',JSON.stringify(output));
const license=await (await fetch('https://raw.githubusercontent.com/Logiqx/cubing-algs/master/LICENSE')).text();
fs.writeFileSync('dist/ALGORITHM-LICENSE.txt',license);
console.log('Total',output.length);
