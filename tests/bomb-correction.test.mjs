import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,TYPES,distance,longitudeDelta,missilePosition} from '../public/engine.js';
import {NUCLEAR_CORRECTION} from '../public/balance.js';
import {snapshotSimulation,restoreSimulation} from '../public/save-state.js';
const arena=()=>{const s=new Simulation({mode:'lab',left:'radar',right:'radar',count:1});s.units=[];s.fleets=[];s.cities=[];s.ai=()=>{};s.running=s.started=true;s.add('radar',1,150,-50);return s;};
const save=s=>({version:1,sim:snapshotSimulation(s),preferences:{volume:0,music:0,difficulty:'standard'},view:{speed:1,gridMode:'degree',zoom:1,focus:{x:0,y:0}}});
test('a fresh silo survives three nukes and all subsequent radiation, and the fourth nuke destroys it',()=>{
 const s=arena(),site=s.add('silo',1,0,30);s.cities=[{name:'Test city',team:1,x:0,y:30,pop:20,initial:20,dead:false}];assert.equal(site.hp,40);
 for(let i=1;i<=4;i++){const m={team:0,tx:0,ty:30};s.detonate(m);assert.equal(site.hp,Math.max(0,40-i*10));const hp=site.hp;s.detonate(m);assert.equal(site.hp,hp,'a resolved warhead cannot detonate twice');for(let j=0;j<400;j++){s.time++;s.advanceRadiation(1);}assert.equal(site.hp,hp);assert.equal(site.dead,i===4);}
 assert.ok(s.cities[0].radiationLoss>0);
});
test('old silo maximum HP is repaired proportionally even in a current save, while existing damage is preserved',()=>{
 for(const [hp,expected] of [[20,40],[10,20],[0,0]]){const s=arena(),u=s.add('silo',0,0,30);u.maxHp=20;u.hp=hp;u.dead=hp===0;const r=restoreSimulation(save(s)),copy=r.units.find(v=>v.id===u.id);assert.equal(copy.maxHp,40);assert.equal(copy.hp,expected);assert.equal(copy.dead,u.dead);assert.equal(restoreSimulation(save(r)).units.find(v=>v.id===u.id).hp,expected);}
});
test('bombs deal four HP and existing in-flight bombs adopt the same damage',()=>{
 const s=arena(),u=s.add('bomber',0,0,30),target=s.add('silo',1,1,30);s.random=()=>0;s.fireShot(u,target,{kind:'bomb',probability:1});assert.equal(s.shots[0].damage,4);s.advanceShots(2);assert.equal(target.hp,36);s.fireShot(u,target,{kind:'bomb',probability:1});s.shots[0].damage=3;s.balanceRevision=11;const r=restoreSimulation(save(s));assert.equal(r.shots[0].damage,4);
});
const launch=()=>{const s=arena(),u=s.add('silo',0,-10,30),ship=s.add('carrier',1,0,30);u.mode='launch';s.add('radar',0,0,30);assert.ok(s.launch(u.id,ship.x,ship.y,ship.id).ok);return {s,u,ship,m:s.missiles[0]};};
test('ship nuclear correction waits 30 game seconds and caps total endpoint displacement to 0.05 degrees per update',()=>{
 const {s,ship,m}=launch(),origin={x:m.tx,y:m.ty},duration=m.duration;ship.x=2;ship.y=31;s.time=29.99;s.correctNuclearTarget(m);assert.deepEqual({x:m.tx,y:m.ty},origin);s.time=30;s.correctNuclearTarget(m);assert.ok(Math.abs(distance(origin,{x:m.tx,y:m.ty})-.05)<1e-9);const first={x:m.tx,y:m.ty};s.time=59.99;s.correctNuclearTarget(m);assert.deepEqual({x:m.tx,y:m.ty},first);s.time=60;s.correctNuclearTarget(m);assert.ok(Math.abs(distance(first,{x:m.tx,y:m.ty})-.05)<1e-9);assert.equal(m.duration,duration);assert.equal(NUCLEAR_CORRECTION.interval,30);
});
test('correction obeys sensors, ceasefire, target death, coordinate-only targeting and dateline wrapping',()=>{
 const {s,ship,m}=launch();ship.x=80;s.time=30;s.correctNuclearTarget(m);assert.equal(m.tx,0);ship.x=2;s.time=31;s.correctNuclearTarget(m);assert.equal(m.tx,0);s.time=60;s.correctNuclearTarget(m);assert.equal(Math.abs(m.tx-.05)<1e-9,true);ship.dead=true;s.time=90;s.correctNuclearTarget(m);assert.ok(Math.abs(m.tx-.05)<1e-9);const c=launch();c.m.targetId=null;c.ship.x=4;c.s.time=30;c.s.correctNuclearTarget(c.m);assert.equal(c.m.tx,0);const wrapped=launch();wrapped.s.add('radar',0,179,30);wrapped.m.tx=179.999;wrapped.ship.x=-179;wrapped.s.time=30;wrapped.s.correctNuclearTarget(wrapped.m);assert.ok(longitudeDelta(179.999,wrapped.m.tx)>0);assert.ok(Math.abs(longitudeDelta(179.999,wrapped.m.tx)-.05)<1e-9);
});
test('queued ship targets and correction checkpoint survive reload without granting extra corrections',()=>{
 const {s,u,ship}=launch();u.cooldown=100;assert.ok(s.queueAction(u.id,'nuclear',ship.x,ship.y,ship.id).ok);u.cooldown=0;s.processLaunchQueue(u);const queued=s.missiles.at(-1);assert.equal(queued.targetId,ship.id);ship.x=1;s.time=30;s.correctNuclearTarget(queued);const r=restoreSimulation(save(s)),m=r.missiles.find(v=>v.id===queued.id),point={x:m.tx,y:m.ty};r.correctNuclearTarget(m);assert.deepEqual({x:m.tx,y:m.ty},point);r.time=60;r.correctNuclearTarget(m);assert.ok(Math.abs(distance(point,{x:m.tx,y:m.ty})-.05)<1e-9);r.ai=()=>{};r.tick(.5);const position=missilePosition(m);assert.equal(m.x,position.x);assert.equal(m.y,position.y);
});
