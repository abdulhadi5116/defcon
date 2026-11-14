import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation} from '../public/engine.js';
import {snapshotSimulation,validateSnapshot} from '../public/save-state.js';
test('a fresh enemy projectile without a computed heading cannot corrupt fighter evasion or its save',()=>{const s=new Simulation({mode:'lab',left:'fighter',right:'fighter',count:1});s.units=[];const f=s.add('fighter',0,0,0);s.moveUnit(f,{x:10,y:0});s.shots.push({id:999,targetId:f.id,team:1,x:-1,y:0,tx:0,ty:0,age:0,speed:.4});s.movement(f,.25);for(const v of [f.x,f.y,f.heading,f.fuel,f.breakPoint.x,f.breakPoint.y])assert.ok(Number.isFinite(v));assert.doesNotThrow(()=>validateSnapshot(JSON.parse(JSON.stringify({version:1,sim:snapshotSimulation(s),preferences:{volume:0,music:0,difficulty:'standard'},view:{speed:20,gridMode:'degree',zoom:1,focus:{x:0,y:0}}}))));});
