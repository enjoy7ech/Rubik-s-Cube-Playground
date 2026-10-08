import assert from 'node:assert/strict';
import {fittedFov} from '../src/scene-framing.js';
import {PerspectiveCamera,Vector3} from '../src/vendor/three.module.js';
for(const [width,height] of [[280,550],[450,680],[330,240],[320,110],[900,500]]){
 const camera=new PerspectiveCamera(fittedFov(width,height),width/height,.1,60);
 camera.position.set(5.2,4.2,6.5);camera.lookAt(0,-.12,0);camera.updateMatrixWorld();
 // Bounding sphere covers every viewing rotation, not only the default corners.
 const target=new Vector3(0,-.12,0),distance=camera.position.distanceTo(target),radius=Math.sqrt(3)*1.6+.12;
 const vertical=camera.fov*Math.PI/180,horizontal=2*Math.atan(Math.tan(vertical/2)*camera.aspect);
 assert.ok(Math.asin(radius/distance)<Math.min(vertical,horizontal)/2,`${width}x${height} sphere should fit`);
 for(const x of [-1.6,1.6])for(const y of [-1.6,1.6])for(const z of [-1.6,1.6]){const point=new Vector3(x,y,z).project(camera);assert.ok(Math.abs(point.x)<.9&&Math.abs(point.y)<.9,`${width}x${height} corner needs a margin`)}
}
console.log('Verified full cube bounds and rotation envelope fit tall, narrow, short and desktop stages.');
