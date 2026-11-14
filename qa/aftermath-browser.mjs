import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {Simulation} from '../public/engine.js';
import {snapshotSimulation} from '../public/save-state.js';
const browser=await chromium.launch({executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 let snapshot,revision=1;
 await page.route('**/api/**',r=>r.fulfill({json:new URL(r.request().url()).pathname==='/api/sessions'?{activeId:'aftermath',sessions:[]}:{id:'aftermath',name:'Aftermath',revision:revision++,snapshot}}));
 const results=[];
 for(const [name,x,y,reduced,expected] of [['home',-108,39,false,true],['foreign',2,49,false,false],['ocean',-30,0,false,false],['reduced',-108,39,true,false]]){
  const s=new Simulation({mode:'lab',left:'nuclear',right:'nuclear',count:1});s.started=true;s.running=false;
  s.missiles.push({id:s.nextId++,type:'missile',team:1,sx:0,sy:48,x,y,tx:x,ty:y,p:.999,duration:1,dead:false,hp:1});
  snapshot={version:1,sim:snapshotSimulation(s),preferences:{volume:0,music:0,difficulty:'standard',reduced,audioEnabled:false},view:{layers:{},gridMode:'degree',focus:{x,y},zoom:2,speed:1,selectedId:null}};
  await page.goto('http://localhost:5186');await page.waitForFunction(()=>window.blackout?.session.ready);await page.clock.install();await page.locator('#pause').click();await page.clock.runFor(120);
  const state=await page.evaluate(()=>window.blackout);assert.equal(state.flash,expected,name+' screen effect');assert.ok(state.blasts.some(b=>b.nuclear),name+' must retain the local blast');results.push({name,flash:state.flash,localBlast:true});
 }
 const decay=await page.evaluate(async()=>{
  const {Simulation,contactOpacity}=await import('/engine.js'),{Renderer}=await import('/renderer.js');
  const s=new Simulation({mode:'lab',left:'nuclear',right:'airbase',count:1});const u=s.units.find(u=>u.team===1);s.add('radar',0,u.x-1,u.y);s.detonate({team:0,tx:u.x,ty:u.y});s.detonate({team:0,tx:u.x,ty:u.y});
  const c=document.createElement('canvas');document.body.append(c);const r=new Renderer(c);r.resize();r.focus(u.x,u.y,2);const labels=[];r.text=t=>labels.push(t);r.drawImpactStatus(s);const before=labels.length;s.advanceVisualEffects(6);labels.length=0;r.drawImpactStatus(s);
  const faded=[];for(const speed of [1,5,10,20]){const sim=new Simulation({mode:'lab',left:'radar',right:'radar',count:1});sim.ghosts.set(999,{id:999,type:'fighter',team:1,x:0,y:0,age:0,observed:true,lastSeen:0});sim.ended=true;sim.advanceVisualEffects(.7*speed);faded.push({speed,visible:sim.ghosts.has(999),opacity:contactOpacity(sim.ghosts.get(999)||{age:12},sim.time)});}
  return {before,after:labels.length,blastStillVisible:s.blasts.some(b=>b.nuclear),faded};
 });
 assert.ok(decay.before>0);assert.equal(decay.after,0);assert.ok(decay.blastStillVisible);assert.equal(decay.faded[0].visible,true);assert.equal(decay.faded[3].visible,false);assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,results,decay,errors}));
}finally{await browser.close();}
