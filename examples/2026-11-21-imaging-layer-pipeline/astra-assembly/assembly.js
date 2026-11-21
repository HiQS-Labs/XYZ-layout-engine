// All sheets use the nutrition export's 1000 × 1000 coordinate space.
// Reposition the art on the exploded sheet, then return it to the measured slots.
const scene = document.querySelector('.scene');
const stage = document.querySelector('.stage');
const paper = document.querySelector('.paper');
const art = document.querySelector('.images');
const layout = document.querySelector('.layout');
const techNote = document.querySelector('.tech-note');
const slotName = layout.querySelector('.slot-name');
const canvas = document.querySelector('#canvas');
const guides = document.querySelectorAll('.guides,.notes');
const controls = document.querySelector('nav');
const button = controls.querySelector('button');
const scrub = controls.querySelector('input');
const settings = JSON.parse(document.querySelector('#settings').textContent);
const slots = JSON.parse(document.querySelector('#slots').textContent);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const originalPaper = canvas.style.backgroundImage;
const images = [...canvas.querySelectorAll('img')].map((original, index) => {
  const end = slots[index];
  let start;
  if (original.id === 'hero_img') start = {x:100,y:4,width:780,height:860};
  const food = /^item_(\d+)_img$/.exec(original.id);
  if (food) start = {x:35+(Number(food[1])-1)*230,y:740,width:225,height:225};
  const img = original.cloneNode();
  img.removeAttribute('id');
  img.setAttribute('alt','');
  art.append(img);
  return {img,start,end};
});

let progress = reducedMotion.matches ? 1 : 0;
let frame = 0;
const mix = (from,to,t) => from + (to-from)*t;
const clamp = n => Math.max(0, Math.min(1,n));
function ease(n) {
  const t = clamp(n);
  return t*t*(3-2*t);
}

function draw(value) {
  progress = clamp(value);
  const scale = scene.clientWidth / 1000;
  const small = scene.clientWidth <= 600;
  const endSize = small ? 880 : 550;
  const endX = (1000-endSize)/2;
  const pose = (x,y,sx,sy,t) => {
    const move = 'translate(' + mix(x,endX,t) + 'px,' + mix(y,15,t) + 'px)';
    const tilt = 'perspective(1500px) skewY(' + mix(-13,0,t) + 'deg) rotateY(' + mix(-30,0,t) + 'deg)';
    return move + ' ' + tilt + ' scale(' + mix(sx,endSize/1000,t) + ',' + mix(sy,endSize/1000,t) + ')';
  };
  stage.style.transform = 'scale('+scale+')';
  // Make room for the technical sheet, hold the three-way view, then register all three.
  const styleLayer = settings.showStyleLayer;
  const entered = styleLayer ? ease(progress/.20) : 0;
  const assembly = styleLayer ? clamp((progress-.48)/.40) : progress;
  const openHeight = small ? mix(516,592,entered) : 553;
  scene.style.height = mix(openHeight,endSize+32,ease(assembly))*scale + 'px';
  const settled = progress === 1;
  stage.classList.toggle('split',!settled);
  art.hidden = settled;
  const paperEase = ease(assembly/.86);
  const artEase = ease((assembly-.09)/.91);
  paper.style.transform = pose(mix(144,40,entered),111,mix(.392,.305,entered),.317,paperEase);
  art.style.transform = pose(mix(457,660,entered),106,mix(.452,.32,entered),.323,artEase);
  const layoutOpacity = entered*(1-ease((progress-.90)/.09));
  layout.hidden = layoutOpacity === 0;
  if (!layout.hidden) {
    layout.style.transform = pose(mix(155,354,entered),mix(245,104,entered),.314,.32,paperEase);
    layout.style.opacity = layoutOpacity;
    layout.style.setProperty('--board',.96*(1-paperEase));
    slotName.style.opacity = 1-paperEase;
  }
  const noteOpacity = ease((progress-.08)/.12)*Number(styleLayer)*(1-ease((progress-.48)/.12));
  techNote.hidden = !noteOpacity;
  techNote.style.opacity = noteOpacity;
  const reveal = ease((assembly-.28)/.67);
  canvas.style.backgroundImage = settled ? originalPaper :
    'linear-gradient(rgba(225,228,198,'+(1-reveal)+'),rgba(225,228,198,'+(1-reveal)+')),'+originalPaper;
  art.style.setProperty('--tint',.12*(1-artEase));
  art.style.setProperty('--outline',1-artEase);
  for (const node of guides) {
    const opacity = 1-ease(progress/(styleLayer ? .10 : .30));
    node.style.opacity = opacity;
    node.hidden = opacity === 0;
  }
  for (const {img,start,end} of images) {
    const from = start || end;
    img.style.left = mix(from.x,end.x,artEase)+'px';
    img.style.top = mix(from.y,end.y,artEase)+'px';
    img.style.width = mix(from.width,end.width,artEase)+'px';
    img.style.height = mix(from.height,end.height,artEase)+'px';
    img.style.opacity = start ? mix(.9,1,artEase) : reveal;
  }
  scrub.value = Math.round(progress*1000);
  scrub.setAttribute('aria-valuetext',Math.round(progress*100)+'% assembled');
  if (reducedMotion.matches) {
    button.textContent = settled ? 'Explode' : styleLayer && progress < .34 ? 'Show layout' : 'Assemble';
    return;
  }
  button.textContent = frame ? 'Pause' : settled ? 'Replay' : progress ? 'Resume' : 'Assemble';
}

function stop() {
  cancelAnimationFrame(frame);
  frame = 0;
}
function play(holdMs=0) {
  stop();
  const from = progress === 1 ? 0 : progress;
  const start = performance.now()+holdMs;
  function tick(now) {
    const next = from+Math.max(0,now-start)/settings.assemblyMs;
    frame = next < 1 ? requestAnimationFrame(tick) : 0;
    draw(next);
  }
  frame = requestAnimationFrame(tick);
  draw(from);
}
button.addEventListener('click',() => {
  if (frame) {stop();draw(progress);}
  else if (reducedMotion.matches) draw(progress===1 ? 0 : settings.showStyleLayer && progress < .34 ? .34 : 1);
  else play();
});
scrub.addEventListener('input',() => {stop();draw(Number(scrub.value)/1000);});
new ResizeObserver(() => draw(progress)).observe(document.querySelector('header'));
reducedMotion.addEventListener('change',() => {if (reducedMotion.matches) {stop();draw(1);} else draw(progress);});
let beforePrint;
addEventListener('beforeprint',() => {beforePrint=progress;stop();draw(1);});
addEventListener('afterprint',() => {if (beforePrint !== undefined) draw(beforePrint);beforePrint=undefined;});
draw(progress);
Promise.all([document.fonts.ready,...Array.from(document.images,img=>img.decode())]).then(() => {
  controls.hidden = false;
  document.documentElement.dataset.ready = 'true';
  if (settings.autoAssemble && !reducedMotion.matches) play(settings.holdMs);
});
