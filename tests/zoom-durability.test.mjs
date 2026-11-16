import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,TYPES,COMBAT_CHANCES,selectionRanges,distance} from '../public/engine.js';
import {Renderer,cityVisible} from '../public/renderer.js';
import {snapshotSimulation,restoreSimulation} from '../public/save-state.js';
const arena=()=>{const s=new Simulation({mode:'lab',left:'radar',right:'radar',count:1});s.units=[];s.fleets=[];s.cities=[];s.ai=()=>{};s.started=s.running=true;s.add('radar',1,150,0);return s;};
const save=s=>({version:1,sim:snapshotSimulation(s),preferences:{volume:0,music:0,difficulty:'standard'},view:{speed:1,gridMode:'degree',zoom:1,focus:{x:0,y:0}}});
test('all ships share actual 0.10 movement while aircraft use the requested speeds',()=>{
 for(const [type,speed] of [['battleship',.1],['carrier',.1],['submarine',.1],['fighter',.5],['bomber',.25]]){
  const s=arena(),u=s.add(type,0,0,30);u.heading=0;u.manualControl=true;assert.ok(s.order(u.id,50,30));
  s.movement(u,1);assert.equal(TYPES[type].speed,speed);assert.ok(Math.abs(distance(u,{x:0,y:30})-speed)<1e-9);
 }
});
test('fighter turns back tightly rather than making a full wide orbit',()=>{
 const s=arena(),u=s.add('fighter',0,0,30);u.manualControl=true;u.heading=0;s.order(u.id,-10,30);
 let turn=0,before=u.heading,maxOffset=0;
 for(let i=0;i<20;i++){s.movement(u,.25);turn+=Math.abs(Math.atan2(Math.sin(u.heading-before),Math.cos(u.heading-before)));before=u.heading;maxOffset=Math.max(maxOffset,u.x);}
 assert.ok(Math.cos(u.heading)<-.98);assert.ok(turn<Math.PI+.3);assert.ok(maxOffset<.7);
 const target=s.add('bomber',1,u.x-1,u.y);u.heading=Math.PI;s.combat(u);assert.ok(s.shots.some(p=>p.targetId===target.id));assert.ok(u.breakUntil-s.time<=4.5);
});
test('fuel remains a distance budget and zero fuel crashes both aircraft at the last reachable point',()=>{
 for(const type of ['fighter','bomber']){const s=arena(),u=s.add(type,0,0,30);u.manualControl=true;u.heading=0;u.fuel=.01;s.order(u.id,10,30);const r=selectionRanges(u,s).find(r=>r.kind==='fuel');assert.equal(r.radius,.01);assert.equal(r.ellipse,undefined);s.movement(u,1);assert.ok(Math.abs(u.x-.01)<1e-8);assert.equal(u.fuel,0);assert.equal(u.dead,true);}
});
test('every unit has more HP and all conventional matchup probabilities are halved',()=>{
 const oldHp={battleship:3,carrier:3,submarine:1,fighter:1,bomber:1,silo:25,airbase:15,radar:1};
 const old={battleship:{submarine:.3,battleship:.1,carrier:.2,fighter:.12,bomber:.1},carrier:{fighter:.03,bomber:.06},submarine:{submarine:.1,battleship:.2,carrier:.2},fighter:{submarine:.03,battleship:.1,carrier:.1,fighter:.1,bomber:.3},bomber:{submarine:.25,battleship:.25,carrier:.25},silo:{fighter:.1,bomber:.1}};
 for(const [type,hp] of Object.entries(oldHp))assert.ok(TYPES[type].hp>hp);
 for(const [attacker,row] of Object.entries(old))for(const [target,chance] of Object.entries(row))assert.equal(COMBAT_CHANCES[attacker][target],chance/2);
 assert.ok(COMBAT_CHANCES.silo.missile<.4);assert.ok(COMBAT_CHANCES.fighter.missile<.25);
});
test('legacy durability and in-flight odds migrate once without healing damage ratios or resurrecting units',()=>{
 const s=arena(),ship=s.add('battleship',0,0,30),plane=s.add('bomber',1,1,30),dead=s.add('fighter',1,20,30);s.balanceRevision=5;ship.maxHp=3;ship.hp=1;plane.maxHp=1;plane.hp=1;dead.maxHp=1;dead.hp=0;dead.dead=true;
 s.shots.push({id:999,sourceId:ship.id,targetId:plane.id,targetMissile:false,kind:'sam',probability:.1});
 const r=restoreSimulation(save(s)),u=r.units.find(u=>u.id===ship.id);assert.equal(u.maxHp,6);assert.equal(u.hp,2);assert.equal(r.units.find(u=>u.id===dead.id).dead,true);assert.equal(r.units.find(u=>u.id===dead.id).hp,0);assert.equal(r.shots[0].probability,.05);assert.equal(r.balanceRevision,6);assert.equal(u.ammo,ship.ammo);
 const again=restoreSimulation(save(r));assert.equal(again.units.find(v=>v.id===ship.id).hp,2);assert.equal(again.shots[0].probability,.05);
});
test('city detail increases monotonically with zoom while selected small cities remain visible',()=>{
 const cities=[.1,1,3,6,12,30].map((pop,i)=>({name:'City '+i,pop}));let previous=0;
 for(const zoom of [1,2,3,4,5,6]){const count=cities.filter(c=>cityVisible(c,zoom)).length;assert.ok(count>=previous);previous=count;}
 assert.equal(cities.filter(c=>cityVisible(c,1)).length,2);assert.equal(previous,cities.length);assert.equal(cityVisible(cities[0],1,cities[0].name),true);
});
test('unit icons and fleet spacing scale together across zoom levels',()=>{
 const r=Object.create(Renderer.prototype);r.width=1440;r.height=950;r.pan={x:0,y:0};
 const ratios=[];for(const zoom of [1,2,4,6]){r.zoom=zoom;const a=r.project(0,0),b=r.project(1,0),spacing=Math.abs(b.x-a.x);ratios.push(r.iconSize()/spacing);assert.ok(r.iconSize()<spacing);}
 for(const ratio of ratios)assert.ok(Math.abs(ratio-.85)<1e-9);
});
