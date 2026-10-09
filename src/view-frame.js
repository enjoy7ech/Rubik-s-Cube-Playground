const normals={R:[1,0,0],L:[-1,0,0],U:[0,1,0],D:[0,-1,0],F:[0,0,1],B:[0,0,-1]};
const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);
const neg=v=>v.map(n=>-n);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export function viewFrame(towardViewer,screenUp,previous=null){
 let front=Object.keys(normals).reduce((best,face)=>dot(normals[face],towardViewer)>dot(normals[best],towardViewer)?face:best,'F');
 if(previous&&dot(normals[front],towardViewer)-dot(previous.F,towardViewer)<.12)front=Object.keys(normals).find(face=>dot(normals[face],previous.F)===1);
 const F=normals[front],choices=Object.values(normals).filter(n=>dot(n,F)===0);
 let U=choices.reduce((best,n)=>dot(n,screenUp)>dot(best,screenUp)?n:best,choices[0]);
 if(previous&&dot(previous.U,F)===0&&dot(U,screenUp)-dot(previous.U,screenUp)<.12)U=previous.U;
 const R=cross(U,F);return{R,L:neg(R),U,D:neg(U),F,B:neg(F)};
}
export const frameKey=frame=>[...frame.F,...frame.U].join(',');
export function stateInView(state,frame){const basis=[frame.R,frame.U,frame.F];return state.map(s=>({p:basis.map(n=>dot(s.p,n)),n:basis.map(n=>dot(s.n,n)),c:s.c}))}
export function viewToken(token,frame,toWorld=false){
 const match=token.match(/^([2-9]?)([A-Za-z])(w?)(2'?|')?$/);if(!match)return token;
 const[,depth,face,wide,suffix='']=match,upper=face.toUpperCase();
 if(normals[upper]){
  const normal=toWorld?frame[upper]:normals[upper],mapped=Object.keys(normals).find(name=>dot(toWorld?normals[name]:frame[name],normal)===1);
  return depth+(face===face.toLowerCase()?mapped.toLowerCase():mapped)+wide+suffix;
 }
 const specs={M:[0,1],E:[1,1],S:[2,-1],x:[0,-1],y:[1,-1],z:[2,-1]},spec=specs[face];if(!spec)return token;
 const basis=[frame.R,frame.U,frame.F],axis=spec[0],components=toWorld?basis[axis]:basis.map(n=>n[axis]),mappedAxis=components.findIndex(n=>n!==0),letters='xyz'.includes(face)?['x','y','z']:['M','E','S'],mapped=letters[mappedAxis];
 const flip=spec[1]*components[mappedAxis]!==specs[mapped][1];
 return mapped+(suffix.startsWith('2')?'2':(suffix==="'")!==flip?"'":'');
}
