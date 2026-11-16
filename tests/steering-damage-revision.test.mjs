import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,TYPES,NUCLEAR,weaponDamage,distance} from '../public/engine.js';
import {snapshotSimulation,restoreSimulation} from '../public/save-state.js';
import {WARHEAD_SPEED} from '../public/balance.js';
const arena=()=>{const s=new Simulation({mode:'lab',left:'radar',right:'radar',count:1});s.units=[];s.fleets=[];s.cities=[];s.ai=()=>{};s.running=s.started=true;s.phase=4;s.add('radar',1,150,-50);return s;};
const save=s=>({version:1,sim:snapshotSimulation(s),preferences:{volume:0,music:0,difficulty:'standard'},view:{speed:1,gridMode:'degree',zoom:1,focus:{x:0,y:0}}});
test('all gun hits deal half HP, depth charges deal two, and all conventional missiles deal one regardless of target class',()=>{
 for(const [source,target,kind,damage] of [['fighter','bomber','gun',.5],['carrier','fighter','gun',.5],['battleship','bomber','gun',.5],['carrier','submarine','depthcharge',2],['fighter','submarine','depthcharge',2],...['carrier','battleship','submarine'].map(t=>['battleship',t,'sam',1]),['battleship','fighter','sam',1],['fighter','carrier','sam',1],['submarine','carrier','torpedo',3],['bomber','silo','bomb',4]]){
  const s=arena(),u=s.add(source,0,0,30),e=s.add(target,1,1,30);if(target==='submarine')e.mode='launch';s.random=()=>0;assert.equal(weaponDamage(u,e,kind),damage);s.fireShot(u,e,{kind,range:9,probability:1});assert.equal(s.shots[0].damage,damage);const hp=e.hp;s.advanceShots(2);assert.equal(e.hp,hp-damage);
 }
 assert.equal(TYPES.battleship.hp,18);assert.equal(TYPES.carrier.hp,20);assert.equal(NUCLEAR.coreRadius,1.2);assert.equal(NUCLEAR.visualRadius,5);assert.equal(WARHEAD_SPEED.ballistic,.06);assert.equal(WARHEAD_SPEED.direct,.06);
});
test('old saves adopt new ship HP proportionally and update in-flight weapon damage only once',()=>{
 const s=arena();s.balanceRevision=9;const b=s.add('battleship',0,0,30),c=s.add('carrier',1,1,30);b.maxHp=15;b.hp=7.5;c.maxHp=18;c.hp=9;s.fireShot(b,c,{kind:'sam'});s.shots[0].damage=1;s.fireShot(c,b,{kind:'gun'});s.shots[1].damage=1;s.fireShot(c,b,{kind:'depthcharge'});s.shots[2].damage=1;
 const r=restoreSimulation(save(s));assert.equal(r.units.find(u=>u.id===b.id).hp,9);assert.equal(r.units.find(u=>u.id===c.id).hp,10);assert.deepEqual(r.shots.map(p=>p.damage),[1,.5,2]);const again=restoreSimulation(save(r));assert.deepEqual(again.units.map(u=>[u.hp,u.maxHp]),r.units.map(u=>[u.hp,u.maxHp]));assert.deepEqual(again.shots,r.shots);
});
test('reversing or crossing the current course decelerates and turns gradually before recovering full fleet speed',()=>{
 for(const dest of [{x:-8,y:30},{x:5,y:42}]){const s=arena(),f=s.fleet(Array(6).fill('battleship'),0,0,30),members=s.units.filter(u=>u.fleetId===f.id),ref=members[0];s.commandFleet(ref,{x:40,y:30});for(let i=0;i<120;i++)s.tick(1);assert.ok(f.motion.speed>.049);const previous=f.motion.speed,before={x:ref.x,y:ref.y},spacing=distance(members[0],members[1]);s.commandFleet(ref,dest);s.tick(1);assert.ok(f.motion.speed<previous);assert.ok(ref.x>before.x,'fleet must not instantly translate backward');assert.ok(Math.abs(f.motion.heading)<=TYPES.battleship.turn+1e-9);let slow=f.motion.speed,maxTurn=0,heading=f.motion.heading;for(let i=0;i<180;i++){s.tick(1);maxTurn=Math.max(maxTurn,Math.abs(Math.atan2(Math.sin(f.motion.heading-heading),Math.cos(f.motion.heading-heading))));heading=f.motion.heading;slow=Math.min(slow,f.motion.speed);assert.ok(Math.abs(distance(members[0],members[1])-spacing)<1e-6);}assert.ok(slow<.02);assert.ok(maxTurn<=TYPES.battleship.turn+1e-9);assert.ok(f.motion.speed>.049);}
});
test('fleet acceleration and course survive reload deterministically and a zero-time tick is safe',()=>{
 const s=arena(),f=s.fleet(Array(6).fill('carrier'),0,0,30),u=s.units.find(u=>u.fleetId===f.id);s.commandFleet(u,{x:30,y:30});for(let i=0;i<100;i++)s.tick(1);s.commandFleet(u,{x:-10,y:30});for(let i=0;i<12;i++)s.tick(1);const r=restoreSimulation(save(s));r.ai=()=>{};s.tick(0);r.tick(0);for(let i=0;i<100;i++){s.tick(.5);r.tick(.5);}assert.deepEqual(r.units.map(u=>[u.x,u.y,u.heading]),s.units.map(u=>[u.x,u.y,u.heading]));assert.deepEqual(r.fleets.map(f=>f.motion),s.fleets.map(f=>f.motion));
});

test('legacy moving fleets recover their course from their trail before the first new movement command',()=>{const s=arena(),f=s.fleet(Array(6).fill('carrier'),0,0,30),u=s.units.find(u=>u.fleetId===f.id);s.commandFleet(u,{x:30,y:30});for(let i=0;i<120;i++)s.tick(1);const data=save(s);data.sim.balanceRevision=9;delete data.sim.fleets[0].motion;const r=restoreSimulation(data);r.ai=()=>{};const ship=r.units.find(v=>v.id===u.id),before=ship.x;r.commandFleet(ship,{x:-20,y:30});r.tick(1);assert.ok(ship.x>before);assert.ok(r.fleets[0].motion.speed<.05);});
