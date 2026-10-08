import fs from 'node:fs';
let html=fs.readFileSync('dist/index.html','utf8');
html=html.replace('<dialog id="helpDialog">','<dialog id="handbookDialog" aria-labelledby="handbookTitle"><div class="handbook-header"><div><h2 id="handbookTitle">公式手册</h2><p>随手查公式，关闭后继续当前魔方</p></div><button class="close" aria-label="关闭公式手册">×</button></div><iframe id="handbookFrame" title="浮窗公式手册"></iframe></dialog><dialog id="helpDialog">');
fs.writeFileSync('dist/index.html',html);
let game=fs.readFileSync('dist/game-v2.js','utf8');game=game.replace("location.href='library.html'","openHandbook()");
game+=`\nconst handbook=$('#handbookDialog'),handbookFrame=$('#handbookFrame');
function openHandbook(favorites=false){pause();cubeScene.cancelLayerDrag?.();if(!handbookFrame.hasAttribute('src'))handbookFrame.src='library.html?handbook=1'+(favorites?'&favorites=1':'');else if(favorites)handbookFrame.contentWindow?.postMessage({type:'handbook-favorites'},location.origin);handbook.showModal()}
$$('a[href^="library.html"]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();openHandbook(link.getAttribute('href').includes('favorites'))}));
handbook.addEventListener('close',()=>handbookFrame.contentWindow?.postMessage({type:'handbook-close'},location.origin));
window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===handbookFrame.contentWindow&&event.data?.type==='handbook-dismiss')handbook.close()});\n`;
fs.writeFileSync('dist/game-v2.js',game);
let library=fs.readFileSync('dist/library.js','utf8');
library=`const embeddedHandbook=new URLSearchParams(location.search).has('handbook');if(embeddedHandbook)document.body.classList.add('handbook-page');\n`+library;
library+=`\nif(embeddedHandbook){
 window.addEventListener('message',event=>{if(event.origin!==location.origin||event.source!==parent)return;if(event.data?.type==='handbook-close'){$$('dialog[open]').forEach(dialog=>dialog.close());demoPlayer?.close()}else if(event.data?.type==='handbook-favorites')$('#favorites').click()});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('dialog[open]')){event.preventDefault();parent.postMessage({type:'handbook-dismiss'},location.origin)}});
}\n`;
fs.writeFileSync('dist/library.js',library);
fs.appendFileSync('dist/game.css',`\n#handbookDialog{width:min(1120px,95vw);height:min(850px,92dvh);max-height:92dvh;padding:0;overflow:hidden;border:1px solid #dce3d3;border-radius:22px;background:#faf8f2}#handbookDialog[open]{display:flex;flex-direction:column}#handbookDialog::backdrop{background:rgba(49,61,43,.28);backdrop-filter:blur(4px)}.handbook-header{display:flex;align-items:center;justify-content:space-between;padding:17px 24px;border-bottom:1px solid #e6e7dc;flex-shrink:0}.handbook-header h2{margin:0;font-size:20px}.handbook-header p{margin:5px 0 0;font-size:12px;color:#858a7e}.handbook-header .close{position:static;flex-shrink:0;margin-left:15px}#handbookFrame{border:0;width:100%;flex:1;min-height:0;background:#faf8f2}.handbook-page .side-rail,.handbook-page .app-header{display:none}.handbook-page .app-shell{margin-left:0}.handbook-page .app-section{padding:20px 24px}.handbook-page .section-head h2{font-size:25px}.handbook-page .section-head .kicker,.handbook-page .section-head p{display:none}.handbook-page .section-head{margin-bottom:18px}.handbook-page .source-note{font-size:10px}@media(max-width:600px){#handbookDialog{width:96vw;height:94dvh;max-height:94dvh;border-radius:16px}.handbook-header{padding:12px 16px}.handbook-header h2{font-size:18px}.handbook-page .app-section{padding:15px 12px}}\n`);
