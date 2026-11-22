// GH-8 Phase 0b: display-size copy of a generated PNG. Usage: node make-web-asset.mjs <src.png> <out.png> <size>
// Downscales so the longer side is <size> px, through the pinned runtime's existing renderSatori (Satori -> resvg),
// exactly as the Solar System example makes its assets/web copies; the canvas has no background, so alpha is kept.
// Prints the output's dimensions, bytes and sha256 as one JSON line.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const RT=new URL('../../',import.meta.url);
const {loadSatori,renderSatori}=await import(new URL('tools/render.mjs',RT).href);

const [src,out,sizeArg]=process.argv.slice(2);
const size=Number(sizeArg);
if(!src||!out||!Number.isInteger(size)||size<16){console.error('usage: node make-web-asset.mjs <src.png> <out.png> <size>');process.exit(2)}
const buf=await fs.readFile(src);
if(!(buf.length>=24&&buf.readUInt32BE(0)===0x89504e47&&buf.readUInt32BE(4)===0x0d0a1a0a))throw new Error(`${src} is not a PNG`);
const w=buf.readUInt32BE(16),h=buf.readUInt32BE(20);
if(size>Math.max(w,h))throw new Error(`refusing to upscale: ${w}x${h} source, ${size} px requested`);
const ow=Math.round(w*size/Math.max(w,h)),oh=Math.round(h*size/Math.max(w,h));
const fonts={regular:await fs.readFile(new URL('tools/spike/assets/font.ttf',RT)),bold:await fs.readFile(new URL('tools/spike/assets/font-bold.ttf',RT))};
const node=(type,style,children,extra={})=>({type,props:{style,children,...extra}});
const scene=node('div',{display:'flex',width:ow,height:oh},[node('img',{position:'absolute',left:0,top:0,width:ow,height:oh,objectFit:'contain'},undefined,{src:`data:image/png;base64,${buf.toString('base64')}`})]);
await loadSatori();
const {png}=await renderSatori(scene,fonts,ow,oh);
await fs.writeFile(out,png);
console.log(JSON.stringify({out,width:png.readUInt32BE(16),height:png.readUInt32BE(20),bytes:png.length,sha256:crypto.createHash('sha256').update(png).digest('hex')}));
