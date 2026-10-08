// Rasterize the site's simple cube mark without external dependencies.
import {mkdirSync,writeFileSync} from 'node:fs';
import {deflateSync} from 'node:zlib';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const directory=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../src/icons');
mkdirSync(directory,{recursive:true});
const crc=buffer=>{let value=0xffffffff;for(const byte of buffer){value^=byte;for(let i=0;i<8;i++)value=(value>>>1)^((value&1)?0xedb88320:0)}return(value^0xffffffff)>>>0};
function chunk(type,data){const name=Buffer.from(type),size=Buffer.alloc(4),checksum=Buffer.alloc(4);size.writeUInt32BE(data.length);checksum.writeUInt32BE(crc(Buffer.concat([name,data])));return Buffer.concat([size,name,data,checksum])}
const faces=[
 {points:[[.5,.24],[.76,.39],[.5,.54],[.24,.39]],color:[155,183,132]},
 {points:[[.24,.39],[.5,.54],[.5,.84],[.24,.69]],color:[238,197,129]},
 {points:[[.5,.54],[.76,.39],[.76,.69],[.5,.84]],color:[219,155,173]}
];
function inside(x,y,points){let hit=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [a,b]=points[i],[c,d]=points[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)hit=!hit}return hit}
function point(points,u,v){return [0,1].map(axis=>points[0][axis]*(1-u)*(1-v)+points[1][axis]*u*(1-v)+points[2][axis]*u*v+points[3][axis]*(1-u)*v)}
const tiles=faces.flatMap(face=>Array.from({length:9},(_,i)=>{const col=i%3,row=Math.floor(i/3),gap=.019,u=col/3+gap,v=row/3+gap,endU=(col+1)/3-gap,endV=(row+1)/3-gap;return{points:[point(face.points,u,v),point(face.points,endU,v),point(face.points,endU,endV),point(face.points,u,endV)],color:face.color}}));
for(const size of [180,192,512]){
 const bytes=Buffer.alloc((size*4+1)*size);for(let y=0;y<size;y++){const offset=y*(size*4+1);for(let x=0;x<size;x++){const color=[0,0,0];for(let sy=0;sy<2;sy++)for(let sx=0;sx<2;sx++){const tile=tiles.find(tile=>inside((x+(sx+.5)/2)/size,(y+(sy+.5)/2)/size,tile.points));const sample=tile?.color||[250,248,242];for(let c=0;c<3;c++)color[c]+=sample[c]/4}for(let c=0;c<3;c++)bytes[offset+1+x*4+c]=Math.round(color[c]);bytes[offset+1+x*4+3]=255}}
 const header=Buffer.alloc(13);header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
 const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(bytes)),chunk('IEND',Buffer.alloc(0))]);
 writeFileSync(path.join(directory,`icon-${size}.png`),png);if(size===512)writeFileSync(path.join(directory,'maskable-512.png'),png);
}
console.log('Generated PWA cube icons.');
