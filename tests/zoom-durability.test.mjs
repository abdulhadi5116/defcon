import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,TYPES,COMBAT_CHANCES,selectionRanges,distance} from '../public/engine.js';
import {Renderer,cityLabelVisible,cityMarkerSize} from '../public/renderer.js';
import {snapshotSimulation,restoreSimulation} from '../public/save-state.js';
const arena=()=>{const s=new Simulation({mode:'lab',left:'radar',right:'radar',count:1});s.units=[];s.fleets=[];s.cities=[];s.ai=()=>{};s.started=s.running=true;s.add('radar',1,150,0);return s;};
const save=s=>({version:1,sim:snapshotSimulation(s),preferences:{volume:0,music:0,difficulty:'standard'},view:{speed:1,gridMode:'degree',zoom:1,focus:{x:0,y:0}}});
test('all ships share actual 0.05 movement while aircraft use the requested speeds',()=>{
 for(const [type,speed] of [['battleship',.05],['carrier',.05],['submarine',.05],['fighter',.25],['bomber',.1]]){
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
test('revised building durability and weapon matchups keep valid probabilities',()=>{assert.equal(TYPES.silo.hp,30);assert.equal(TYPES.airbase.hp,20);assert.equal(COMBAT_CHANCES.fighter.fighter,.2);assert.equal(COMBAT_CHANCES.bomber.silo,.65);for(const row of Object.values(COMBAT_CHANCES))for(const p of Object.values(row))assert.ok(p>0&&p<=1);});
test('legacy durability and in-flight odds migrate once without healing damage ratios or resurrecting units',()=>{
 const s=arena(),ship=s.add('battleship',0,0,30),plane=s.add('bomber',1,1,30),dead=s.add('fighter',1,20,30);s.balanceRevision=5;ship.maxHp=3;ship.hp=1;plane.maxHp=1;plane.hp=1;dead.maxHp=1;dead.hp=0;dead.dead=true;
 s.shots.push({id:999,sourceId:ship.id,targetId:plane.id,targetMissile:false,kind:'sam',probability:.1});
 const r=restoreSimulation(save(s)),u=r.units.find(u=>u.id===ship.id);assert.equal(u.maxHp,18);assert.equal(u.hp,6);assert.equal(r.units.find(u=>u.id===dead.id).dead,true);assert.equal(r.units.find(u=>u.id===dead.id).hp,0);assert.equal(r.shots[0].probability,.1);assert.equal(r.balanceRevision,12);assert.equal(u.ammo,ship.ammo);
 const again=restoreSimulation(save(r));assert.equal(again.units.find(v=>v.id===ship.id).hp,6);assert.equal(again.shots[0].probability,.1);
});
test('city label detail increases monotonically with zoom while selected small cities remain visible',()=>{
 const cities=[.1,1,3,6,12,30].map((pop,i)=>({name:'City '+i,pop}));let previous=0;
 for(const zoom of [1,2,3,4,5,6]){const count=cities.filter(c=>cityLabelVisible(c,zoom)).length;assert.ok(count>=previous);previous=count;}
 assert.equal(cities.filter(c=>cityLabelVisible(c,1)).length,2);assert.equal(previous,cities.length);assert.equal(cityLabelVisible(cities[0],1,cities[0].name),true);
});
test('unit and population marker sizes stay readable and consistent on screen at every zoom',()=>{
 const r=Object.create(Renderer.prototype);r.width=1440;r.height=950;r.pan={x:0,y:0};r.iconBounds={};
 for(const zoom of [1,2,4,6]){r.zoom=zoom;assert.ok(r.iconSize()>=18&&r.iconSize()<23);assert.equal(cityMarkerSize(30),Math.min(25,6+4.5*Math.log2(31)));assert.ok(cityMarkerSize(.1)>=5);assert.ok(cityMarkerSize(100)<=25);}
 r.iconBounds.silo={width:.4,height:.6};const box=r.unitBox({type:'silo',mode:'launch'});assert.equal(box.halfHeight,r.iconSize()/2+2);assert.ok(box.halfWidth>=6);
});
test('fleet glyphs remain separated and individually pickable at low zoom without moving simulated ships',()=>{
 const s=arena(),f=s.fleet(['carrier','battleship','submarine','carrier','battleship','submarine'],0,0,30),members=s.units.filter(u=>u.fleetId===f.id),before=members.map(u=>[u.x,u.y]);
 const r=Object.create(Renderer.prototype);r.width=1440;r.height=950;r.pan={x:0,y:0};r.iconBounds={};r.visibilityMode='radar';
 for(const zoom of [1,2,4,6]){r.focus(0,30,zoom);r.layoutUnits(s);const points=members.map(u=>r.unitScreen(u));for(let i=0;i<points.length;i++){assert.equal(r.pick(s,points[i].x,points[i].y)?.id,members[i].id);for(let j=i+1;j<points.length;j++)assert.ok(Math.hypot(points[i].x-points[j].x,points[i].y-points[j].y)>=22-.001);}}
 r.focus(0,30,1);r.selected=members[0].id;r.layoutUnits(s);assert.equal(r.unitOffsets.has(r.selected),false);assert.deepEqual(r.unitDisplayPoint(members[0]),members[0]);assert.deepEqual(members.map(u=>[u.x,u.y]),before);
});
test('fleet display layout never uses or exposes hidden enemy contacts',()=>{
 const s=arena(),f=s.fleet(Array(6).fill('submarine'),1,70,30),r=Object.create(Renderer.prototype);r.width=1440;r.height=950;r.pan={x:0,y:0};r.zoom=1;r.visibilityMode='radar';r.layoutUnits(s);for(const id of f.members)assert.equal(r.unitOffsets.has(id),false);
});
