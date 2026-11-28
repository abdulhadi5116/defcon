import test from 'node:test';import assert from 'node:assert/strict';import {Simulation} from '../public/engine.js';import {snapshotSimulation} from '../public/save-state.js';import {ServerGame} from '../server/realtime/game.js';import {stateDelta,applyDelta,wireState} from '../public/live-protocol.js';
const fixture=()=>{const sim=new Simulation();sim.started=sim.running=true;sim.ai=()=>{};return {version:1,sim:snapshotSimulation(sim),preferences:{volume:0,music:0,difficulty:'standard'},view:{speed:1,gridMode:'degree',zoom:1,focus:{x:0,y:0}}};};
test('server clock follows wall time and global speed, pauses, and survives restoration without resetting time',()=>{const g=ServerGame.create(fixture(),'Clock',1000);g.sim.ai=()=>{};g.advance(3000,10000);assert.equal(g.sim.time,2);g.command({method:'speed',args:[5]});g.advance(4000,10000);assert.equal(g.sim.time,7);g.command({method:'pause',args:[true]});g.advance(10000);assert.equal(g.sim.time,7);g.command({method:'pause',args:[false]});g.advance(11000,10000);assert.equal(g.sim.time,12);const saved=g.save(),r=new ServerGame(saved,11000);r.sim.ai=()=>{};r.advance(12000,10000);assert.equal(r.sim.time,17);});
test('command protocol rejects arbitrary simulation methods, invalid coordinates and enemy return orders',()=>{const g=ServerGame.create(fixture(),'Commands',0);for(const command of [{method:'tick',args:[999]},{method:'speed',args:[-1]},{method:'order',args:[1,Infinity,0]},{method:'deploy',args:['silo',0,999]}])assert.throws(()=>g.command(command));assert.equal(g.command({method:'returnHome',args:[99999]}).ok,false);});
test('delta protocol reconstructs entity changes, removals and unkeyed explosions exactly',()=>{const old=wireState(fixture().sim),next=structuredClone(old);next.units[0].x++;delete next.units[0].order;next.units.pop();next.blasts=[{x:0,y:0,nuclear:true},{x:1,y:1,nuclear:false}];next.time=10;const result=applyDelta(structuredClone(old),stateDelta(old,next));assert.deepEqual(result,next);});
test('server navigation cache preserves exact coastline results and bounds memory',async()=>{const {ServerNavigation}=await import('../server/realtime/navigation.js'),{Navigation}=await import('../public/navigation.js');const land={features:[{geometry:{type:'Polygon',coordinates:[[[0,0],[2,0],[2,2],[0,2],[0,0]]]}}]},cached=new ServerNavigation(land),plain=new Navigation(land);for(const clearance of [.05,1,2])for(const [x,y] of [[1,1],[2.01,1],[3,1],[5,5]]){assert.equal(cached.navigable(x,y,clearance),plain.navigable(x,y,clearance));assert.equal(cached.navigable(x,y,clearance),plain.navigable(x,y,clearance));}for(let i=0;i<8300;i++)cached.navigable(10+i/10000,10);assert.ok(cached.waterPoints.size<=8192);});

test('high speed advances the same clock and naval distance with fewer ticks',()=>{
 const results=[];
 for(const speed of [1,5,10,20]){
  const game=ServerGame.create(fixture(),'Speed',0),sim=game.sim;
  const ship=sim.units.find(unit=>unit.type==='battleship');
  sim.units=[ship,...sim.units.filter(unit=>unit.team!==ship.team&&unit.type==='radar').slice(0,1)];
  sim.fleets=[];sim.navigation=null;sim.ai=()=>{};
  ship.fleetId=null;ship.x=0;ship.y=0;ship.heading=0;
  ship.path=[{x:20,y:0}];ship.order=ship.path[0];
  sim.seaSegmentAllowed=()=>true;
  game.command({method:'speed',args:[speed]});
  const tick=sim.tick.bind(sim);let steps=0;
  sim.tick=dt=>{steps++;tick(dt);};
  game.advance(20000/speed,10000);
  assert.equal(sim.time,20);
  assert.ok(Math.abs(ship.x-2)<1e-8);
  results.push(steps);
 }
 assert.deepEqual(results,[80,20,20,20]);
});

test('an incoming shot lands for the same damage at every speed',()=>{
 for(const speed of [1,5,10,20]){
  const game=ServerGame.create(fixture(),'Combat',0),sim=game.sim;
  const source=sim.add('silo',0,0,0);
  const target=sim.add('silo',1,1,0);
  sim.units=[source,target];sim.fleets=[];sim.ai=()=>{};
  source.x=0;source.y=0;target.x=1;target.y=0;
  const hp=target.hp;
  sim.fireShot(source,target,{range:5,speed:1});
  game.command({method:'speed',args:[speed]});
  const steps=[],tick=sim.tick.bind(sim);
  sim.tick=dt=>{steps.push(dt);tick(dt);};
  game.advance(1000/speed,10000);
  assert.deepEqual(steps,Array(4).fill(.25));
  assert.equal(sim.shots.length,0);
  assert.equal(target.hp,hp-1);
 }
});

test('fictional landmark persists and rewards its living launch silo once per impact',async()=>{
 const {ARUNIKA_COUNCIL}=await import('../public/engine.js');
 const game=ServerGame.create(fixture(),'Arunika',0),sim=game.sim;
 const silo=sim.add('silo',0,0,0),ammo=silo.ammo;
 const fire=(x,y)=>sim.detonate({tx:x,ty:y,team:0,sourceId:silo.id,dead:false});
 const {x,y}=ARUNIKA_COUNCIL;
 fire(x+3,y);
 assert.equal(sim.arunikaHp,30);
 fire(x,y);fire(x,y);fire(x,y);fire(x,y);
 assert.equal(sim.arunikaHp,0);
 assert.equal(silo.ammo,ammo+3);
 assert.equal(new ServerGame(game.save(),0).sim.arunikaHp,0);
});
