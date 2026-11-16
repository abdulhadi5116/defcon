import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,operationRanges,distance,MODES} from '../public/engine.js';
import {snapshotSimulation,restoreSimulation} from '../public/save-state.js';
const arena=()=>{const s=new Simulation({mode:'lab',left:'radar',right:'radar',count:1});s.units=[];s.fleets=[];s.cities=[];s.ai=()=>{};s.started=s.running=true;return s;};
const save=s=>({version:1,sim:snapshotSimulation(s),preferences:{volume:0,music:0,difficulty:'standard'},view:{speed:1,gridMode:'degree',zoom:1,focus:{x:0,y:0}}});
test('host fighter payload is captured per queued launch and cannot change in flight',()=>{
 for(const type of ['carrier','airbase']){
  const s=arena(),h=s.add(type,0,0,30);h.cooldown=20;
  assert.ok(s.setFighterPayload(h.id,'antisub').ok);assert.ok(s.queueAction(h.id,'aircraft',2,30).ok);
  assert.ok(s.setFighterPayload(h.id,'combat').ok);assert.ok(s.queueAction(h.id,'aircraft',3,30).ok);
  h.cooldown=0;s.processLaunchQueue(h);const first=s.units.at(-1);assert.equal(first.mode,'antisub');
  assert.equal(s.setMode(first.id,'combat').ok,false);assert.equal(first.mode,'antisub');
  const r=restoreSimulation(save(s)),copy=r.units.find(u=>u.id===h.id);copy.cooldown=0;r.processLaunchQueue(copy);
  assert.equal(r.units.at(-1).mode,'combat');assert.equal(copy.fighterPayload,'combat');
 }
});
test('battleship AA guns work inside two degrees while the six-degree missile reloads',()=>{
 const s=arena(),ship=s.add('battleship',0,0,30),e=s.add('bomber',1,6.01,30);
 s.combat(ship);assert.equal(s.shots.length,0);e.x=5.99;s.combat(ship);assert.deepEqual(s.shots.map(p=>p.kind),['sam']);
 e.x=2.01;s.combat(ship);assert.equal(s.shots.length,1);e.x=1.99;s.combat(ship);assert.equal(s.shots.at(-1).kind,'gun');
 assert.equal(ship.cooldown,20);assert.equal(s.shots.at(-1).maxDistance,2.5);
});
test('active submarine torpedoes have six-degree reach and inflict three damage on arrival',()=>{
 const s=arena(),sub=s.add('submarine',0,0,30),e=s.add('carrier',1,6.01,30);sub.mode='active';s.random=()=>0;
 s.combat(sub);assert.equal(s.shots.length,0);e.x=5.99;s.combat(sub);assert.equal(s.shots[0].damage,3);s.advanceShots(31);assert.equal(e.hp,17);
});
test('each selected unit shows at most one weapon ring and carrier Anti Submarine is named clearly',()=>{
 const s=arena();for(const type of ['battleship','carrier','fighter','submarine','bomber','silo'])for(const mode of (MODES[type]||[{id:'combat'}])){const u=s.add(type,0,0,30);u.mode=mode.id;assert.ok(operationRanges(u).filter(r=>r.kind==='weapon').length<=1);}
 assert.equal(MODES.carrier.find(m=>m.id==='antisub').name,'Anti Submarine');
});
test('bomber releases from its center overhead, flies beyond the target and lines up another pass before returning on fuel',()=>{
 const s=arena(),h=s.add('airbase',0,-6,30),target=s.add('silo',1,0,30);h.mode='bomber';target.cooldown=1e6;s.random=()=>0;s.add('radar',0,0,30);
 const b=s.launchAircraft(h.id,0,30,{targetId:target.id}).unit,fire=s.fireShot.bind(s);let drops=0,egress=false,goaround=false,previous=-100;
 s.fireShot=(u,e,opts)=>{if(u===b){assert.equal(opts.kind,'bomb');assert.ok(distance(u,e)<=.65);assert.ok(s.time-previous>20);previous=s.time;const angle=Math.atan2(e.y-u.y,e.x-u.x);assert.ok(Math.abs(Math.atan2(Math.sin(angle-u.heading),Math.cos(angle-u.heading)))<=Math.PI/6);drops++;}fire(u,e,opts);if(u===b){assert.equal(s.shots.at(-1).sx,b.x);assert.equal(s.shots.at(-1).sy,b.y);}};
 for(let i=0;i<2800&&!b.landed&&!b.dead;i++){s.tick(.25);egress ||= b.bombRunStage==='egress'&&distance(b,target)>4;goaround ||= b.bombRunStage==='goaround';}
 assert.ok(drops>=2);assert.ok(egress);assert.ok(goaround);assert.equal(b.landed,true);assert.ok(b.fuel>0);assert.equal(b.homeId,h.id);
});
test('old airborne bomber pass state recovers into the new approach without a permanent firing lock',()=>{
 const s=arena(),b=s.add('bomber',0,-1,30),target=s.add('silo',1,0,30);b.passReady=false;b.target=b.engageTargetId=target.id;
 const r=restoreSimulation(save(s)),copy=r.units.find(u=>u.id===b.id);r.airDestination(copy,r.units.find(u=>u.id===target.id));assert.equal(copy.passReady,true);assert.equal(copy.bombRunStage,'approach');
});
