import * as THREE from 'three';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';

function roundedTile(width,radii){const h=width/2,[bl,br,tr,tl]=radii,s=new THREE.Shape();s.moveTo(-h+bl,-h);s.lineTo(h-br,-h);s.quadraticCurveTo(h,-h,h,-h+br);s.lineTo(h,h-tr);s.quadraticCurveTo(h,h,h-tr,h);s.lineTo(-h+tl,h);s.quadraticCurveTo(-h,h,-h,h-tl);s.lineTo(-h,-h+bl);s.quadraticCurveTo(-h,-h,-h+bl,-h);const geometry=new THREE.ExtrudeGeometry(s,{depth:.052,bevelEnabled:true,bevelThickness:.006,bevelSize:.008,bevelSegments:4,steps:1,curveSegments:16});geometry.computeVertexNormals();return geometry;}

export class CubeScene{
 constructor(canvas){
  this.canvas=canvas;this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.92;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(32,1,.1,60);this.camera.position.set(5.2,4.2,6.5);
  this.controls=new OrbitControls(this.camera,canvas);this.controls.target.set(0,-.12,0);this.controls.enableDamping=true;this.controls.dampingFactor=.09;this.controls.enablePan=false;this.controls.minDistance=6;this.controls.maxDistance=14;this.controls.rotateSpeed=.6;this.controls.maxPolarAngle=Math.PI*.90;this.controls.update();
  const environment=new RoomEnvironment();const generator=new THREE.PMREMGenerator(this.renderer);this.environment=generator.fromScene(environment,.045).texture;this.scene.environment=this.environment;environment.dispose();generator.dispose();
  this.scene.add(new THREE.HemisphereLight(0xfffbef,0xa9b698,.7));
  const key=new THREE.DirectionalLight(0xfff5e3,2);key.position.set(-3,9,3);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.camera.near=.1;key.shadow.camera.far=20;key.shadow.normalBias=.025;key.shadow.bias=-.0001;key.shadow.radius=8;this.scene.add(key);
  const fill=new THREE.DirectionalLight(0xe3edff,1);fill.position.set(5,2,-3);this.scene.add(fill);
  this.floor=new THREE.Mesh(new THREE.PlaneGeometry(35,35),new THREE.ShadowMaterial({color:0x6d795f,opacity:.07}));this.floor.rotation.x=-Math.PI/2;this.floor.position.y=-1.6;this.floor.receiveShadow=true;this.scene.add(this.floor);
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=256;const sc=shadowCanvas.getContext('2d'),gradient=sc.createRadialGradient(128,128,5,128,128,128);gradient.addColorStop(0,'rgba(55,75,42,.28)');gradient.addColorStop(.45,'rgba(55,75,42,.16)');gradient.addColorStop(1,'rgba(55,75,42,0)');sc.fillStyle=gradient;sc.fillRect(0,0,256,256);const shadow=new THREE.Mesh(new THREE.PlaneGeometry(5.5,5.5),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-1.595;this.scene.add(shadow);
  this.root=new THREE.Group();this.scene.add(this.root);this.bodyGeometry=new RoundedBoxGeometry(.968,.968,.968,6,.046);this.tileGeometry=roundedTile(.95,[.07,.07,.07,.07]);this.geometryCache=new Map();
  this.bodyMaterial=new THREE.MeshPhysicalMaterial({color:0x232925,roughness:.37,metalness:0,clearcoat:.3,clearcoatRoughness:.32,envMapIntensity:.24});
  this.tileMaterials=['#eabd49','#f1eee5','#dd7b95','#eaa36b','#62ab89','#6b9dc9'].map(color=>new THREE.MeshPhysicalMaterial({color,roughness:.25,metalness:0,clearcoat:.72,clearcoatRoughness:.22,envMapIntensity:.35}));
  this.groups=[];this.stickers=[];this.lastSignature='';this.size=0;this.axis=new THREE.Vector3();this.quaternion=new THREE.Quaternion();
  this.lastTime=0;this.renderer.setAnimationLoop(()=>{this.controls.update();this.renderer.render(this.scene,this.camera)});
  canvas.dataset.renderer='webgl';
 }
 resize(){const r=this.canvas.getBoundingClientRect();if(r.width<1||r.height<1)return;this.renderer.setSize(r.width,r.height,false);this.camera.aspect=r.width/r.height;this.camera.updateProjectionMatrix();}
 rebuild(size){this.root.clear();this.groups=[];this.groupMap=new Map();this.stickers=[];this.size=size;this.root.scale.setScalar(3/size);const m=(size-1)/2;for(let x=0;x<size;x++)for(let y=0;y<size;y++)for(let z=0;z<size;z++){if(x>0&&x<size-1&&y>0&&y<size-1&&z>0&&z<size-1)continue;const group=new THREE.Group();group.userData.position=[x-m,y-m,z-m];group.position.set(...group.userData.position);const body=new THREE.Mesh(this.bodyGeometry,this.bodyMaterial);body.castShadow=true;body.receiveShadow=true;group.add(body);this.root.add(group);this.groups.push(group);this.groupMap.set(group.userData.position.join(','),group)}this.lastSignature='';}
 update(state,size,animation){
  if(this.size!==size)this.rebuild(size);
  const signature=state.map(s=>[...s.p,...s.n,s.c].join(',')).join(';');
  if(signature!==this.lastSignature){for(let i=0;i<state.length;i++){const s=state[i];let tile=this.stickers[i];if(!tile){tile=new THREE.Mesh(this.tileGeometry,this.tileMaterials[s.c]);tile.castShadow=true;tile.receiveShadow=true;this.stickers[i]=tile}tile.material=this.tileMaterials[s.c];tile.position.set(...s.n).multiplyScalar(.445);tile.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(...s.n));tile.geometry=this.capGeometry(s,tile.quaternion,size);this.groupMap.get(s.p.join(',')).add(tile)}this.lastSignature=signature}
  for(const group of this.groups){group.position.set(...group.userData.position);group.quaternion.identity();if(animation?.selected(group.userData.position)){this.axis.set(animation.axis===0?1:0,animation.axis===1?1:0,animation.axis===2?1:0);this.quaternion.setFromAxisAngle(this.axis,animation.angle);group.position.applyQuaternion(this.quaternion);group.quaternion.copy(this.quaternion)}}
 }
 capGeometry(sticker,quaternion,size){if(size!==3)return this.tileGeometry;const p=new THREE.Vector3(...sticker.p),localX=new THREE.Vector3(1,0,0).applyQuaternion(quaternion),localY=new THREE.Vector3(0,1,0).applyQuaternion(quaternion),x=Math.round(p.dot(localX)),y=Math.round(p.dot(localY));const key=x+','+y;if(this.geometryCache.has(key))return this.geometryCache.get(key);let radii=[.045,.045,.045,.045],width=.964;if(x===0&&y===0){radii=[.235,.235,.235,.235];width=.95}else for(const[i,[cx,cy]]of [[-1,-1],[1,-1],[1,1],[-1,1]].entries()){if((x===0||cx===-Math.sign(x))&&(y===0||cy===-Math.sign(y)))radii[i]=x===0||y===0?.185:.20}const geometry=roundedTile(width,radii);this.geometryCache.set(key,geometry);return geometry}
 resetView(){this.camera.position.set(5.2,4.2,6.5);this.controls.target.set(0,-.12,0);this.controls.update()}
}
