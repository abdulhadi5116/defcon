import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,TYPES,MODES,NUCLEAR,aircraftFuel,operationRanges} from '../public/engine.js';
import {ASW_COMBAT} from '../public/balance.js';
import {mapCommand} from '../public/commands.js';
import {snapshotSimulation,restoreSimulation} from '../public/save-state.js';
const arena=()=>{const s=new Simulation({mode:'lab',left:'radar',right:'radar',count:1});s.units=[];s.fleets=[];s.cities=[];s.ai=()=>{};s.started=s.running=true;s.add('radar',1,150,0);return s;};
const save=s=>({version:1,sim:snapshotSimulation(s),preferences:{volume:0,music:0,difficulty:'standard'},view:{speed:1,gridMode:'degree',zoom:1,focus:{x:0,y:0}}});
test('fighter hosts use twenty-five-degree return radius, retaining consumed fuel when an old session loads',()=>{
 for(const type of ['carrier','airbase']){const s=arena(),h=s.add(type,0,0,30);assert.equal(aircraftFuel('fighter',type),50);assert.equal(operationRanges(h).find(r=>r.kind==='fuel').radius,25);const f=s.launchAircraft(h.id,5,30).unit;f.fuel=43;f.maxFuel=50;f.fuelRevision=5;const r=restoreSimulation(save(s)),copy=r.units.find(u=>u.id===f.id);assert.equal(copy.maxFuel,50);assert.equal(copy.fuel,43);assert.equal(restoreSimulation(save(r)).units.find(u=>u.id===f.id).fuel,43);}
 assert.equal(ASW_COMBAT.carrierRange,1);
});
test('nuclear launch preparation takes 120 game seconds for silos and submarines',()=>{
 for(const type of ['silo','submarine']){const s=arena(),u=s.add(type,0,0,30);assert.ok(s.setMode(u.id,'launch').ok);assert.equal(u.stateTimer,120);for(let i=0;i<119;i++)s.tick(1);assert.equal(u.stateTimer,1);s.tick(1);assert.equal(u.stateTimer,0);}
 assert.equal(MODES.submarine.find(m=>m.id==='launch').name,'Nuclear Launch');
});
test('a submarine accepts an attack during active sonar preparation, persists it and only fires after readiness',()=>{
 for(const fleet of [false,true]){const s=arena();let sub;if(fleet){const f=s.fleet(Array(6).fill('submarine'),0,0,30);sub=s.units.find(u=>u.id===f.members[0]);}else sub=s.add('submarine',0,0,30);const target=s.add('carrier',1,3.8,30);s.add('radar',0,0,30);assert.ok(s.setMode(sub.id,'active').ok);const result=mapCommand(s,{selectedId:sub.id,unit:target,point:target}).result;assert.equal(result.ok,true);assert.equal(result.queued,true);assert.match(result.reason,/queued/i);assert.equal(sub.engageTargetId,target.id);s.combat(sub);assert.equal(s.shots.length,0);const r=restoreSimulation(save(s));r.ai=()=>{};for(let i=0;i<19;i++)r.tick(1);assert.equal(r.shots.length,0);r.tick(1);assert.ok(r.shots.some(p=>p.sourceId===sub.id&&p.targetId===target.id&&p.kind==='torpedo'));}
});
test('passive submarine and impossible target commands remain rejected',()=>{const s=arena(),u=s.add('submarine',0,0,30),e=s.add('carrier',1,1,30),plane=s.add('fighter',1,1,30);assert.equal(s.order(u.id,e.x,e.y,e.id),false);s.setMode(u.id,'active');assert.equal(s.order(u.id,plane.x,plane.y,plane.id),false);});
test('nuclear shock damages every nearby ship with doubled center damage and distance falloff, without radiation',()=>{
 const s=arena(),ships=[0,.5,1,1.5,2,2.1].map(x=>s.add('carrier',1,x,30)),base=s.add('silo',1,0,30),air=s.add('fighter',1,0,30);s.detonate({team:0,tx:0,ty:30});assert.deepEqual(ships.map(u=>u.hp),[0,5,10,15,20,20]);assert.equal(base.hp,30);assert.equal(air.hp,4);assert.equal(s.blasts.find(b=>b.nuclear).impacts.filter(hit=>ships.some(u=>u.id===hit.unitId)).length,4);const before=ships.map(u=>u.hp);for(let i=0;i<400;i++)s.advanceRadiation(1);assert.deepEqual(ships.map(u=>u.hp),before);assert.equal(NUCLEAR.damageRadius,2);
});
test('one blast applies splash to a circular six-ship formation in lab and gameplay equally',()=>{
 const results=[];for(const mode of ['lab','war']){const s=arena();s.mode=mode;const f=s.fleet(Array(6).fill('carrier'),1,0,30);s.detonate({team:0,tx:0,ty:30});results.push(f.members.map(id=>s.units.find(u=>u.id===id).hp));}assert.ok(results[0].every(hp=>Math.abs(hp-10)<1e-9));assert.deepEqual(results[0],results[1]);
});

test('active sonar submarine torpedoes engage active and passive submerged opponents without ordinary weapons bypassing stealth',()=>{
 for(const mode of ['passive','active']){const s=arena(),u=s.add('submarine',0,0,30),enemy=s.add('submarine',1,mode==='passive'?1.4:3.9,30);u.mode='active';enemy.mode=mode;s.random=()=>0;assert.equal(s.canTarget(u,enemy),true);s.combat(u);assert.equal(s.shots[0].kind,'torpedo');for(let i=0;i<31;i++)s.advanceShots(1);assert.equal(enemy.hp,4);enemy.x=mode==='passive'?1.51:4.01;u.cooldown=0;assert.equal(s.acquireTarget(u),undefined);u.mode='passive';assert.equal(s.canTarget(u,enemy),false);}
});
