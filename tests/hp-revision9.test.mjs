import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,TYPES} from '../public/engine.js';
import {snapshotSimulation,restoreSimulation} from '../public/save-state.js';
const save=s=>({version:1,sim:snapshotSimulation(s),preferences:{volume:0,music:0,difficulty:'standard'},view:{speed:1,gridMode:'degree',zoom:1,focus:{x:0,y:0}}});
test('revised HP applies to new units and old saves once while preserving damage and destroyed status',()=>{
 const s=new Simulation({mode:'lab',left:'radar',right:'radar',count:1});s.units=[];s.balanceRevision=8;
 for(const [type,old,current] of [['bomber',4,8],['fighter',5,4],['carrier',20,20]]){const u=s.add(type,0,0,30);assert.equal(u.maxHp,current);assert.equal(TYPES[type].hp,current);u.maxHp=old;u.hp=old/2;}
 const dead=s.add('fighter',1,1,30);dead.dead=true;dead.maxHp=5;dead.hp=0;
 const r=restoreSimulation(save(s));assert.equal(r.balanceRevision,18);for(const u of r.units.filter(u=>!u.dead))assert.equal(u.hp,u.maxHp/2);assert.equal(r.units.at(-1).hp,0);
 const again=restoreSimulation(save(r));assert.deepEqual(again.units.map(u=>[u.hp,u.maxHp,u.dead]),r.units.map(u=>[u.hp,u.maxHp,u.dead]));
});
