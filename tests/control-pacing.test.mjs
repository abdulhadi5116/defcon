import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,distance} from '../public/engine.js';
import {cityMarkerSize} from '../public/renderer.js';
import {snapshotSimulation,restoreSimulation} from '../public/save-state.js';
import {SessionClient} from '../public/sessions.js';
const arena=()=>{const s=new Simulation({mode:'lab',left:'radar',right:'radar',count:1});s.units=[];s.fleets=[];s.cities=[];s.ai=()=>{};s.started=s.running=true;s.add('radar',1,150,0);return s;};
test('fleet starts moving in its requested direction with gradual acceleration',()=>{const s=arena(),f=s.fleet(Array(6).fill('battleship'),0,0,30),ships=s.units.filter(u=>u.fleetId===f.id),before=ships.map(u=>({x:u.x,y:u.y}));for(const u of ships)u.heading=Math.PI/2;assert.ok(s.commandFleet(ships[0],{x:20,y:30}));s.tick(1);for(const [i,u] of ships.entries()){assert.ok(u.x>before[i].x+.004&&u.x<before[i].x+.01);assert.ok(Math.abs(u.y-before[i].y)<1e-8);assert.ok(distance(u,before[i])<=.050001);}});
test('airfield releases three FIFO fighter orders within eleven simulation seconds',()=>{const s=arena(),h=s.add('airbase',0,0,30);for(const x of [5,6,7])assert.ok(s.queueAction(h.id,'aircraft',x,30).ok);for(let i=0;i<11;i++)s.tick(1);assert.equal(h.launchQueue.length,0);assert.equal(h.fighters,2);assert.equal(s.units.filter(u=>u.homeId===h.id).length,3);});
test('small city markers are visibly larger without losing population size differences',()=>{assert.ok(cityMarkerSize(.1)>=5);assert.ok(cityMarkerSize(1)>=5);assert.ok(cityMarkerSize(30)>cityMarkerSize(1));assert.ok(cityMarkerSize(100)>12);});
test('20x autosave captures at most four checkpoints per wall-clock minute rather than every two seconds',async()=>{
 const names=['document','addEventListener','setInterval','sessionStorage','localStorage'],old=new Map(names.map(k=>[k,globalThis[k]])),nowFn=Date.now;let now=0,interval,period,captures=0,writes=0;const values=new Map();
 try{Date.now=()=>now;globalThis.document={addEventListener:()=>{}};globalThis.addEventListener=()=>{};globalThis.setInterval=(cb,ms)=>{interval=cb;period=ms;return 1;};globalThis.sessionStorage=globalThis.localStorage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
 const c=new SessionClient({capture:()=>{captures++;return {time:now*20};},getSpeed:()=>20,apply:()=>{},status:()=>{},conflict:()=>{}});c.current={id:'pacing',revision:1};c.request=async()=>{writes++;return {id:'pacing',revision:writes+1};};c.start();for(now=period;now<=60000;now+=period){await interval();await c.wait();}assert.ok(captures<=4,`captured ${captures} times`);assert.ok(writes<=4,`wrote ${writes} times`);
 }finally{Date.now=nowFn;for(const [k,v] of old)if(v===undefined)delete globalThis[k];else globalThis[k]=v;}
});

test('legacy airfield cooldowns adopt the shorter queue interval without dropping orders or stock',()=>{const s=arena(),h=s.add('airbase',0,0,30);s.queueAction(h.id,'aircraft',5,30);s.queueAction(h.id,'aircraft',6,30);h.cooldown=120;const value={version:1,sim:snapshotSimulation(s),preferences:{volume:0,music:0,difficulty:'standard'},view:{speed:1,gridMode:'degree',zoom:1,focus:{x:0,y:0}}},r=restoreSimulation(value),host=r.units.find(u=>u.id===h.id);r.ai=()=>{};assert.equal(host.cooldown,5);assert.equal(host.launchQueue.length,1);assert.equal(host.fighters,4);for(let i=0;i<5;i++)r.tick(1);assert.equal(host.launchQueue.length,0);assert.equal(host.fighters,3);});
test('a busy autosave never queues another capture behind an in-flight save',()=>{let captures=0;const c=new SessionClient({capture:()=>{captures++;return {};},getSpeed:()=>20,apply:()=>{},status:()=>{},conflict:()=>{}});c.lastAttempt=0;c.pending=new Promise(()=>{});for(let i=0;i<100;i++)c.autosave();assert.equal(captures,0);});
