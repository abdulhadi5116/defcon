import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Navigation} from '../public/navigation.js';
import {Simulation,distance} from '../public/engine.js';
const land=JSON.parse(fs.readFileSync(new URL('../public/assets/land.json',import.meta.url)));
test('one distant fleet command exits Hudson Bay through Hudson Strait',()=>{
 const s=new Simulation({mode:'lab',left:'radar',right:'radar',count:1});s.units=[];s.fleets=[];s.cities=[];s.navigation=new Navigation(land);
 const f=s.fleet(Array(6).fill('carrier'),0,-85.25,58.84),ships=s.units.filter(u=>u.fleetId===f.id);
 assert.ok(s.commandFleet(ships[0],{x:-40,y:45}),'a distant open-water order must find the bay exit');
 for(const u of ships){let a=u;for(const b of u.path){assert.ok(s.navigation.clear(a,b,f.navigationClearance),'every hull leg stays in water');a=b;}}
 for(let tick=0;tick<7000&&ships.some(u=>u.order);tick++){s.prepareFleetAvoidance(1);for(const u of ships){const before={x:u.x,y:u.y};s.movement(u,1);assert.ok(distance(before,u)<=.100001);assert.equal(s.navigation.land(u.x,u.y),false);}s.time++;}
 assert.ok(ships.every(u=>!u.order),'all hulls must finish without a second order');
});
test('the hidden passage is bidirectional, respects permissions, and cannot cut through shore',()=>{
 const n=new Navigation(land),bay={x:-85.25,y:58.84},ocean={x:-40,y:45};
 for(const [a,b] of [[bay,ocean],[ocean,bay]]){const path=n.route(a,b,.09);assert.ok(path);let previous=a;for(const point of path){assert.ok(n.clear(previous,point,.09));previous=point;}assert.deepEqual(path.at(-1),b);}
 assert.equal(n.route(bay,ocean,.09,(x)=>x< -75),null);
 assert.equal(n.route(bay,{x:-85,y:50},.09),null,'land remains an invalid destination');
});
test('placement rejects an isolated lake and the confined bay without consuming a fleet',()=>{
 const s=new Simulation({seed:42});s.navigation=new Navigation(land);s.territoryMap={contains:()=>true};
 const stock=structuredClone(s.stock[0]),before=s.fleets.length;
 for(const point of [{x:-85.25,y:58.84},{x:51,y:42}]){assert.equal(s.navigation.land(point.x,point.y),false);const result=s.deploy('carrier',point.x,point.y,Array(6).fill('carrier'));assert.equal(result.ok,false);assert.match(result.reason,/exit/);}
 assert.deepEqual(s.stock[0],stock);assert.equal(s.fleets.length,before);assert.equal(s.navigation.fleetPlacement(-40,45),true);
});
