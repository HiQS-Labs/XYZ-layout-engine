// GH-8 Phase 0 alpha inspector. Usage: node inspect-alpha.mjs <file> [file...]
// Prints one JSON object per file (one per line). Container facts (format, PNG IHDR, tRNS, WebP alpha flag)
// come from header bytes; pixel facts come from the pinned runtime's Chromium decoding the image into a canvas.
// There is no hand-written pixel decoder here.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';

const {chromium}=await import('playwright');

const files=process.argv.slice(2);
if(!files.length){console.error('usage: node inspect-alpha.mjs <file> [file...]');process.exit(2)}

function header(buf){
 const out={format:'other',mime:'application/octet-stream',headerAlpha:false};
 if(buf.length>=24&&buf.readUInt32BE(0)===0x89504e47&&buf.readUInt32BE(4)===0x0d0a1a0a&&buf.toString('latin1',12,16)==='IHDR'){
  out.format='png';out.mime='image/png';
  out.png={width:buf.readUInt32BE(16),height:buf.readUInt32BE(20),bitDepth:buf[24],colorType:buf[25],hasTRNS:false};
  // Walk chunk headers only (length + type) to learn whether a tRNS chunk exists before the image data.
  for(let o=8;o+8<=buf.length;){
   const len=buf.readUInt32BE(o),type=buf.toString('latin1',o+4,o+8);
   if(type==='tRNS')out.png.hasTRNS=true;
   if(type==='IDAT'||type==='IEND')break;
   o+=12+len;
  }
  // Colour types 4 and 6 carry an alpha sample; a tRNS chunk adds transparency to palette (3), grey (0) or RGB (2).
  out.headerAlpha=out.png.colorType===4||out.png.colorType===6||out.png.hasTRNS;
 }else if(buf.length>=3&&buf[0]===0xff&&buf[1]===0xd8&&buf[2]===0xff){
  out.format='jpeg';out.mime='image/jpeg';
 }else if(buf.length>=16&&buf.toString('latin1',0,4)==='RIFF'&&buf.toString('latin1',8,12)==='WEBP'){
  out.format='webp';out.mime='image/webp';
  const chunk=buf.toString('latin1',12,16);
  out.webp={chunk};
  if(chunk==='VP8X'&&buf.length>20){out.webp.vp8xAlphaFlag=Boolean(buf[20]&0x10);out.headerAlpha=out.webp.vp8xAlphaFlag}
  else if(chunk==='VP8L'&&buf.length>=25&&buf[20]===0x2f){out.webp.vp8lAlphaIsUsed=Boolean((buf.readUInt32LE(21)>>>28)&1);out.headerAlpha=out.webp.vp8lAlphaIsUsed}
 }
 return out;
}

// Runs inside Chromium: decode, draw unscaled, read every pixel's alpha.
async function pixelStats({b64,mime}){
 const blob=await (await fetch(`data:${mime};base64,${b64}`)).blob();
 const bmp=await createImageBitmap(blob,{premultiplyAlpha:'none',colorSpaceConversion:'none'});
 const w=bmp.width,h=bmp.height,c=new OffscreenCanvas(w,h),ctx=c.getContext('2d');
 ctx.drawImage(bmp,0,0);
 const d=ctx.getImageData(0,0,w,h).data;
 let zero=0,partial=0,min=255,max=0;
 for(let i=3;i<d.length;i+=4){const a=d[i];if(a===0)zero++;else if(a<255)partial++;if(a<min)min=a;if(a>max)max=a}
 const at=(x,y)=>d[(y*w+x)*4+3];
 const corners=[at(0,0),at(w-1,0),at(0,h-1),at(w-1,h-1)];
 return {width:w,height:h,pixels:w*h,transparentPixels:zero,partialAlphaPixels:partial,minAlpha:min,maxAlpha:max,cornerAlpha:corners,opaqueCornerCount:corners.filter(a=>a===255).length};
}

const browser=await chromium.launch({headless:true});
let failed=false;
try{
 const page=await browser.newPage();
 for(const file of files){
  const rec={file:path.basename(file)};
  try{
   const buf=await fs.readFile(file);
   const h=header(buf);
   Object.assign(rec,{format:h.format,bytes:buf.length,sha256:crypto.createHash('sha256').update(buf).digest('hex')});
   if(h.png)rec.png={colorType:h.png.colorType,bitDepth:h.png.bitDepth,hasTRNS:h.png.hasTRNS,width:h.png.width,height:h.png.height};
   if(h.webp)rec.webp=h.webp;
   rec.hasAlphaChannel=h.headerAlpha;
   const s=await page.evaluate(pixelStats,{b64:buf.toString('base64'),mime:h.mime});
   rec.decoded={width:s.width,height:s.height,cornerAlpha:s.cornerAlpha,partialAlphaPixels:s.partialAlphaPixels,maxAlpha:s.maxAlpha};
   rec.transparentPixelRatio=Number((s.transparentPixels/s.pixels).toFixed(6));
   rec.minAlpha=s.minAlpha;
   rec.opaqueCornerCount=s.opaqueCornerCount;
   rec.real_alpha=Boolean(rec.hasAlphaChannel&&s.minAlpha<255&&s.transparentPixels>0);
  }catch(e){
   failed=true;rec.error=String(e?.message||e).split('\n')[0];rec.real_alpha=false;
  }
  console.log(JSON.stringify(rec));
 }
}finally{await browser.close()}
process.exit(failed?1:0);
