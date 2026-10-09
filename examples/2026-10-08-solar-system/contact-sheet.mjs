import fs from 'node:fs/promises';
process.env.SPIKE_LIBRARY_ONLY='1';
const {loadSatori,renderSatori}=await import('./runtime/tools/spike/render.mjs');
const fonts={regular:await fs.readFile(new URL('./runtime/tools/spike/assets/font.ttf',import.meta.url)),bold:await fs.readFile(new URL('./runtime/tools/spike/assets/font-bold.ttf',import.meta.url))};
const ids=['sun','mercury','venus','earth','mars','jupiter','saturn','uranus','neptune','asteroid-belt','milky-way'];
const cells=await Promise.all(ids.map(async(id,i)=>({type:'div',props:{style:{display:'flex',flexDirection:'column',position:'absolute',left:(i%4)*300,top:Math.floor(i/4)*290,width:300,height:290,alignItems:'center'},children:[{type:'img',props:{src:'data:image/png;base64,'+(await fs.readFile(new URL('./assets/'+id+'.png',import.meta.url))).toString('base64'),style:{width:250,height:250,objectFit:'contain'}}},{type:'span',props:{style:{fontSize:18,color:'#e6edf7'},children:id}}]}})));
await loadSatori(); const r=await renderSatori({type:'div',props:{style:{display:'flex',width:1200,height:870,backgroundColor:'#070e20',fontFamily:'Inter'},children:cells}},fonts,1200,870);
await fs.writeFile(new URL('./contact-sheet.png',import.meta.url),r.png);
