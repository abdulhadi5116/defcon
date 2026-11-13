import {TYPES} from './engine.js';
const BLUE='#80cedd',RED='#ee8171',MUTED='#57727d';
export const SYMBOLS={battleship:'▰',carrier:'▱',submarine:'⌁',fighter:'✦',bomber:'✥',silo:'♜',radar:'◉'};
export class Renderer {
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.zoom=1;this.pan={x:0,y:0};this.selected=null;this.coverage=false;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.land=null;this.hover=null;this.width=0;this.height=0;this.elapsed=0;this.flash=0;this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);this.ready=fetch('./assets/land.json').then(r=>{if(!r.ok)throw new Error('Map unavailable');return r.json();}).then(d=>this.land=d).catch(()=>{this.land=null;});}
 resize(){const rect=this.canvas.getBoundingClientRect();this.width=rect.width;this.height=rect.height;const ratio=Math.min(devicePixelRatio||1,2);this.canvas.width=rect.width*ratio;this.canvas.height=rect.height*ratio;this.ctx.setTransform(ratio,0,0,ratio,0,0);}
 get scale(){return Math.max(this.width/280,this.height/160)*this.zoom;}
 project(x,y){return {x:this.width/2+(x+30)*this.scale+this.pan.x,y:this.height/2-(y-23)*this.scale+this.pan.y};}
 unproject(x,y){return {x:(x-this.width/2-this.pan.x)/this.scale-30,y:23-(y-this.height/2-this.pan.y)/this.scale};}
 changeZoom(factor,x=this.width/2,y=this.height/2){const p=this.unproject(x,y);this.zoom=Math.max(.65,Math.min(6,this.zoom*factor));const after=this.project(p.x,p.y);this.pan.x+=x-after.x;this.pan.y+=y-after.y;}
 reset(lab=false){this.zoom=lab?2.7:1;this.pan={x:0,y:0};}
 line(x1,y1,x2,y2,color,width=1){const c=this.ctx;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
 text(text,x,y,color=MUTED,size=9,align='left'){const c=this.ctx;c.font=`${size}px Consolas, monospace`;c.fillStyle=color;c.textAlign=align;c.fillText(text,x,y);}
 ring(x,y,r,color,width=1){const c=this.ctx;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
 draw(sim,dt){
  this.elapsed+=dt;const c=this.ctx,w=this.width,h=this.height;if(!w||!h)return;c.clearRect(0,0,w,h);c.fillStyle='#080f14';c.fillRect(0,0,w,h);
  c.save();c.beginPath();c.rect(0,42,w,h-42);c.clip();
  for(let lon=-180;lon<=180;lon+=30){const p=this.project(lon,0);this.line(p.x,0,p.x,h,'#15242d',.7);this.text(`${Math.abs(lon)}°${lon<0?'W':'E'}`,p.x+5,h-69,'#425966',7);}
  for(let lat=-60;lat<=80;lat+=20){const p=this.project(0,lat);this.line(0,p.y,w,p.y,'#15242d',.7);this.text(`${Math.abs(lat)}°${lat<0?'S':'N'}`,11,p.y-5,'#425966',7);}
  if(this.land){c.fillStyle='#101f28';c.strokeStyle='#36505c';c.lineWidth=.8;for(const feature of this.land.features){const polys=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;for(const poly of polys){c.beginPath();for(const ring of poly){let first=true;for(const xy of ring){const p=this.project(xy[0],xy[1]);if(first){c.moveTo(p.x,p.y);first=false;}else c.lineTo(p.x,p.y);}c.closePath();}c.fill('evenodd');c.stroke();}}}
  const sector1=this.project(-160,70),sector2=this.project(-35,5);
  if(sim.phase>=4&&sim.mode==='war'){c.setLineDash([4,7]);c.strokeStyle='#375664';c.lineWidth=.8;c.strokeRect(sector1.x,sector1.y,sector2.x-sector1.x,sector2.y-sector1.y);c.setLineDash([]);this.text('WESTERN COMMAND SECTOR',sector1.x+12,sector2.y-12,'#517c8b',8);}
  for(const [name,x,y] of [['NORTH AMERICA',-108,58],['SOUTH AMERICA',-62,-18],['EUROPE',23,62],['AFRICA',19,5],['ASIA',94,58],['NORTH ATLANTIC',-40,4],['PACIFIC OCEAN',-155,-10],['INDIAN OCEAN',77,-25]]){const p=this.project(x,y);this.text(name,p.x,p.y,name.includes('OCEAN')||name.includes('ATLANTIC')?'#304954':'#48626e',name.includes('OCEAN')?9:10,'center');}
  if(this.coverage){for(const u of sim.units){if(u.dead||!['radar','carrier','silo'].includes(u.type))continue;const p=this.project(u.x,u.y);this.ring(p.x,p.y,(u.type==='radar'?36:24)*this.scale,u.team===0?'#80cedd20':'#ee817115');}}
  if(!this.reduced){const p=this.project(-45,36);const radius=65*this.scale;const angle=this.elapsed*.19;c.save();c.translate(p.x,p.y);c.rotate(angle);const g=c.createConicGradient(-.45,0,0);g.addColorStop(0,'#80cedd00');g.addColorStop(.07,'#80cedd09');g.addColorStop(.071,'#80cedd00');g.addColorStop(1,'#80cedd00');c.fillStyle=g;c.beginPath();c.arc(0,0,radius,0,Math.PI*2);c.fill();c.restore();}
  for(const city of sim.cities){const p=this.project(city.x,city.y);if(p.x<-30||p.x>w+30)continue;const color=city.dead?'#5e4545':city.team===0?BLUE:RED;c.globalAlpha=city.dead?.4:.7;c.fillStyle=color;c.fillRect(p.x-1.5,p.y-1.5,3,3);if(this.zoom>1.3||['New York','Los Angeles','London','Moscow','Tokyo','Beijing','Mumbai'].includes(city.name)){this.text(city.name.toUpperCase(),p.x+6,p.y-3,color,7);this.text(`${city.pop.toFixed(1)}M`,p.x+6,p.y+7,'#69808b',7);}c.globalAlpha=1;}
  for(const u of sim.units){if(u.dead)continue;const p=this.project(u.x,u.y),t=TYPES[u.type],color=u.team===0?BLUE:RED;if(p.x<-20||p.x>w+20||p.y<-20||p.y>h+20)continue;
   if(u.trail.length>1){c.beginPath();for(let i=0;i<u.trail.length;i++){const v=this.project(u.trail[i].x,u.trail[i].y);if(i===0)c.moveTo(v.x,v.y);else c.lineTo(v.x,v.y);}c.strokeStyle=u.team===0?'#80cedd2e':'#ee81712e';c.lineWidth=.8;c.stroke();}
   const selected=this.selected===u.id;
   if(selected){this.ring(p.x,p.y,t.range*this.scale,u.team===0?'#80cedd28':'#ee817128');c.setLineDash([3,3]);this.ring(p.x,p.y,15,color);c.setLineDash([]);this.line(p.x-22,p.y,p.x-17,p.y,color);this.line(p.x+17,p.y,p.x+22,p.y,color);if(u.order){const d=this.project(u.order.x,u.order.y);c.setLineDash([3,5]);this.line(p.x,p.y,d.x,d.y,color,.7);c.setLineDash([]);this.ring(d.x,d.y,4,color);}}
   this.unitIcon(u,p.x,p.y,color,selected?1.2:1);
   if(selected||this.zoom>1.7){this.text(`${u.type.toUpperCase()} ${u.id}`,p.x+11,p.y-8,color,7);c.fillStyle='#263640';c.fillRect(p.x-9,p.y+12,18,2);c.fillStyle=color;c.fillRect(p.x-9,p.y+12,18*u.hp/u.maxHp,2);}
  }
  for(const s of sim.shots){const a=this.project(s.x,s.y),b=this.project(s.tx,s.ty);c.globalAlpha=1-s.age/.4;this.line(a.x,a.y,b.x,b.y,s.team===0?BLUE:RED,1);c.fillStyle='#fff1ba';c.beginPath();c.arc(b.x,b.y,2,0,7);c.fill();c.globalAlpha=1;}
  for(const m of sim.missiles){const start=this.project(m.sx,m.sy),target=this.project(m.tx,m.ty),p=this.project(m.x,m.y);c.beginPath();c.moveTo(start.x,start.y);const curve=this.project((m.sx+m.tx)/2,(m.sy+m.ty)/2+56);c.quadraticCurveTo(curve.x,curve.y,target.x,target.y);c.setLineDash([2,5]);c.strokeStyle=m.team===0?'#80cedd48':'#ee81714d';c.lineWidth=1;c.stroke();c.setLineDash([]);this.ring(target.x,target.y,7,m.team===0?BLUE:RED);this.line(target.x-11,target.y,target.x+11,target.y,m.team===0?'#80cedd66':'#ee817166',.5);this.line(target.x,target.y-11,target.x,target.y+11,m.team===0?'#80cedd66':'#ee817166',.5);c.fillStyle='#fff0cc';c.beginPath();c.arc(p.x,p.y,2.5,0,7);c.fill();this.ring(p.x,p.y,5,'#ffe3b355');this.text('ICBM',p.x+8,p.y-7,m.team===0?BLUE:RED,7);}
  for(const b of sim.blasts){const p=this.project(b.x,b.y);if(b.nuclear){const radius=Math.min(12*this.scale,b.age*9*this.scale);const alpha=Math.max(0,1-b.age/28);c.globalAlpha=alpha;const g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,Math.max(1,radius));g.addColorStop(0,'#fff3d355');g.addColorStop(.25,'#ee817133');g.addColorStop(1,'#ee817100');c.fillStyle=g;c.beginPath();c.arc(p.x,p.y,Math.max(1,radius),0,7);c.fill();this.ring(p.x,p.y,radius,'#f6b796',1.2);this.ring(p.x,p.y,radius*.7,'#ee81715e',.7);this.text('GROUND ZERO',p.x,p.y+radius+12,'#ee8171',7,'center');c.globalAlpha=1;}else{c.globalAlpha=Math.max(0,1-b.age/4);this.ring(p.x,p.y,3+b.age*9,RED);c.globalAlpha=1;}}
  if(this.hover){const p=this.project(this.hover.x,this.hover.y);this.line(p.x-8,p.y,p.x-3,p.y,'#8ba8b455',.6);this.line(p.x+3,p.y,p.x+8,p.y,'#8ba8b455',.6);this.line(p.x,p.y-8,p.x,p.y-3,'#8ba8b455',.6);this.line(p.x,p.y+3,p.x,p.y+8,'#8ba8b455',.6);}
  if(sim.mode==='lab'&&sim.time===0)this.text('ENGAGEMENT READY',w/2,h/2+130,BLUE,11,'center');
  c.restore();
 }
 unitIcon(u,x,y,color,scale=1){const c=this.ctx;c.save();c.translate(x,y);c.scale(scale,scale);c.strokeStyle=color;c.fillStyle='#0d1a23';c.lineWidth=1.1;
  if(u.team===1){c.save();c.rotate(Math.PI/4);c.strokeStyle='#ee81714a';c.strokeRect(-8,-8,16,16);c.restore();}
  c.beginPath();switch(u.type){
   case 'fighter':c.rotate(-u.heading);c.moveTo(8,0);c.lineTo(-6,-6);c.lineTo(-2,0);c.lineTo(-6,6);c.closePath();break;
   case 'bomber':c.rotate(-u.heading);c.moveTo(8,0);c.lineTo(0,-4);c.lineTo(-7,-9);c.lineTo(-4,0);c.lineTo(-7,9);c.lineTo(0,4);c.closePath();break;
   case 'battleship':case 'carrier':c.moveTo(-8,-3);c.lineTo(5,-3);c.lineTo(9,0);c.lineTo(5,3);c.lineTo(-8,3);c.closePath();c.moveTo(-3,-6);c.lineTo(-3,6);if(u.type==='carrier'){c.moveTo(2,-5);c.lineTo(2,5);}break;
   case 'submarine':c.ellipse(0,0,8,3,0,0,7);c.moveTo(-1,-3);c.lineTo(-1,-6);c.lineTo(3,-6);break;
   case 'silo':c.moveTo(-6,6);c.lineTo(0,-6);c.lineTo(6,6);c.closePath();c.moveTo(0,-2);c.lineTo(0,3);break;
   case 'radar':c.arc(0,0,6,0,7);c.moveTo(0,0);c.lineTo(4,-5);break;
  }c.fill();c.stroke();c.restore();
 }
 pick(sim,x,y){let best=null,minimum=18;for(const u of sim.units){if(u.dead)continue;const p=this.project(u.x,u.y);const d=Math.hypot(p.x-x,p.y-y);if(d<minimum){best=u;minimum=d;}}return best;}
}
