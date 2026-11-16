import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:5186');await page.waitForFunction(()=>window.blackout?.session.ready);
 const checks=await page.evaluate(async()=>{
  const {Renderer}=await import('/renderer.js'),{Simulation,selectionRanges}=await import('/engine.js');
  const canvas=document.createElement('canvas');canvas.style='position:fixed;inset:0;width:100vw;height:100vh;z-index:100';document.body.append(canvas);
  const r=new Renderer(canvas);await r.ready;r.resize();await Promise.all(Object.values(r.textures).map(im=>im.complete?Promise.resolve():new Promise(resolve=>im.addEventListener('load',resolve,{once:true}))));
  const s=new Simulation();s.started=true;s.running=false;s.units=[];s.fleets=[];s.blasts=[];
  const cities=[40,20,14,9,7,5,3,2,1,.5].map((pop,i)=>({name:'City '+i,pop,initial:pop,x:(i%3-1)*10,y:(Math.floor(i/3)-1)*4,team:0}));s.cities=cities;r.layers.population=true;
  const text=r.text.bind(r),counts=[],overlaps=[],labels=[];r.text=(v,x,y,color,size,align)=>{if(v.startsWith('CITY ')){r.ctx.font='8px Consolas,monospace';labels.push({name:v,x,y:y-10,w:r.ctx.measureText(v).width+8,h:27});}text(v,x,y,color,size,align);};
  for(const zoom of [1,3,6]){r.focus(0,0,zoom);labels.length=0;r.draw(s,0);counts.push(labels.length);overlaps.push(labels.some((a,i)=>labels.slice(i+1).some(b=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y)));}
  const fleet=s.fleet(['carrier','battleship','submarine','carrier','battleship','submarine'],0,-35,30),members=s.units.filter(u=>u.fleetId===fleet.id),ratios=[];
  for(const zoom of [1,3,6]){r.focus(-35,30,zoom);const p=r.project(members[0].x,members[0].y),q=r.project(members[1].x,members[1].y);ratios.push(r.iconSize()/Math.hypot(p.x-q.x,p.y-q.y));}
  const plane=s.add('fighter',0,-35,30);plane.fuel=8;r.selected=plane.id;r.focus(-35,30,3);const arcs=[],arc=r.ctx.arc.bind(r.ctx);r.ctx.arc=(x,y,radius,...rest)=>{arcs.push({x,y,radius});arc(x,y,radius,...rest);};r.drawOperations(s);const center=r.project(plane.x,plane.y),fuelRing=arcs.some(a=>Math.abs(a.x-center.x)<.01&&Math.abs(a.y-center.y)<.01&&Math.abs(a.radius-plane.fuel*r.scale)<.01);
  const fuel=selectionRanges(plane,s).find(o=>o.kind==='fuel');
  window.zoomQA={r,s,canvas};return {counts,overlaps,ratios,fuelRing,fuel};
 });
 assert.ok(checks.counts[2]>checks.counts[0]);assert.ok(checks.overlaps.every(o=>!o));assert.ok(checks.ratios.every(n=>Math.abs(n-.85)<1e-8));assert.equal(checks.fuelRing,true);assert.equal(checks.fuel.radius,8);assert.equal(checks.fuel.ellipse,undefined);
 await page.evaluate(async()=>{const {r,s}=window.zoomQA,{Simulation}=await import('/engine.js');s.cities=new Simulation().cities;r.selected=null;r.layers.population=true;r.focus(0,12,1);r.draw(s,0);});await page.screenshot({path:'qa/zoom-world-cities.png'});
 await page.evaluate(()=>{const {r,s}=window.zoomQA;r.focus(-35,30,6);r.draw(s,0);});await page.screenshot({path:'qa/zoom-fleet-detail.png'});
 await page.evaluate(()=>{const {r,s}=window.zoomQA;r.selected=s.units.find(u=>u.type==='fighter').id;r.focus(-35,30,3);r.draw(s,0);});await page.screenshot({path:'qa/zoom-aircraft-fuel.png'});
 const fixture=await page.evaluate(async()=>{const {r,canvas}=window.zoomQA;r.resizeObserver.disconnect();canvas.remove();const {Simulation}=await import('/engine.js'),{snapshotSimulation}=await import('/save-state.js'),{SessionClient}=await import('/sessions.js'),s=new Simulation();s.units=[];s.fleets=[];s.started=true;s.running=false;s.phase=1;s.phaseEndsAt=null;s.balanceRevision=5;const h=s.add('carrier',0,-35,30);h.maxHp=3;h.hp=1.5;const plane=s.launchAircraft(h.id,-30,30).unit;plane.maxHp=plane.hp=1;plane.fuel=28;plane.x+=2;s.add('radar',1,100,0);const snapshot={version:1,sim:snapshotSimulation(s),preferences:{volume:0,music:0,difficulty:'standard',visibilityMode:'radar'},view:{speed:1,gridMode:'degree',zoom:3,focus:{x:-33,y:30},selectedId:plane.id}},client=new SessionClient({capture:()=>snapshot,apply:()=>{},status:()=>{},conflict:()=>{}});await client.create('Zoom durability migration QA');return {host:h.id,plane:plane.id};});
 await page.reload();await page.waitForFunction(()=>window.blackout?.session.ready);for(let pass=0;pass<2;pass++){const state=await page.evaluate(()=>window.blackout),host=state.units.find(u=>u.id===fixture.host),plane=state.units.find(u=>u.id===fixture.plane);assert.equal(host.maxHp,6);assert.equal(host.hp,3);assert.equal(plane.hp,3);assert.equal(plane.fuel,28);assert.equal(state.operations.find(r=>r.kind==='fuel').radius,28);assert.equal(state.operations.find(r=>r.kind==='fuel').ellipse,undefined);if(pass===0){await page.screenshot({path:'qa/zoom-live-fuel.png'});await page.reload();await page.waitForFunction(()=>window.blackout?.session.ready);}}
 assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,...checks,saveMigration:'HP ratio and consumed fuel preserved across two real session reloads',errors}));
}finally{await browser.close();}
