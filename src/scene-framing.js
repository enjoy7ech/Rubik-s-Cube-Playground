// Preserve the field of view on the shorter side, including tall phone stages.
export function fittedFov(width,height){
 const base=36;
 return 2*Math.atan(Math.tan(base*Math.PI/360)/Math.min(1,width/height))*180/Math.PI;
}
