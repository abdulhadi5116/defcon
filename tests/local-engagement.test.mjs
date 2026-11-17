import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,TYPES,WARHEAD_SPEED,operationRanges,selectionRanges,distance,nuclearRange} from '../public/engine.js';
import {Renderer,displayVisible} from '../public/renderer.js';
import {validatePreferences,snapshotSimulation,restoreSimulation} from '../public/save-state.js';
import {mapCommand} from '../public/commands.js';
const arena=()=>{const s=new Simulation({mode:'lab',left:'radar',right:'radar',count:1});s.units=[];s.fleets=[];s.cities=[];s.ai=()=>{};s.running=s.started=true;return s;};
test('fighter ship attacks accept map commands and deal real projectile damage within 2 degrees',()=>{
 for(const type of ['battleship','carrier','submarine']){
  const s=arena(),fighter=s.add('fighter',0,0,30),ship=s.add(type,1,1.5,30);
  if(type==='submarine')ship.mode='launch';
  s.random=()=>0;fighter.heading=0;
  assert.equal(mapCommand(s,{selectedId:fighter.id,unit:ship}).result.ok,true);
  s.combat(fighter);
  assert.equal(s.shots.length,2);assert.equal(s.shots[0].targetId,ship.id);
  const hp=ship.hp;s.advanceShots(4);assert.equal(ship.hp,hp-1.5);
 }
});
test('fighter naval attacks retain short range, radar requirements and anti-sub specialization',()=>{
 const s=arena(),fighter=s.add('fighter',0,0,30),ship=s.add('battleship',1,4.1,30);
 fighter.heading=0;s.combat(fighter);assert.equal(s.shots.length,0);
 ship.x=20;assert.equal(mapCommand(s,{selectedId:fighter.id,unit:ship}).result.ok,false);
 ship.x=1;fighter.mode='antisub';assert.equal(s.canTarget(fighter,ship),false);
 const sub=s.add('submarine',1,1,30);sub.mode='passive';assert.equal(s.canTarget(fighter,sub),true);
 s.combat(fighter);assert.equal(s.shots[0].kind,'depthcharge');
});
test('carrier launch states retain short-range AA guns independently of deck cooldown and preparation',()=>{for(const mode of ['fighter','bomber']){const s=arena(),c=s.add('carrier',0,0,30),plane=s.add('bomber',1,5.1,30),ship=s.add('battleship',1,.5,30),sub=s.add('submarine',1,.5,30);c.mode=mode;c.cooldown=120;c.stateTimer=20;sub.mode='launch';assert.equal(s.canTarget(c,ship),false);assert.equal(s.canTarget(c,sub),false);s.combat(c);assert.equal(s.shots.length,0);plane.x=4.9;s.combat(c);assert.equal(s.shots.length,1);assert.equal(s.shots[0].kind,'gun');assert.ok(s.shots[0].gunBurst);assert.equal(c.cooldown,120);assert.equal(c.airDefenseCooldown,10);assert.equal(s.shots[0].targetId,plane.id);assert.equal(s.canTarget(c,{type:'missile',team:1,p:.8,x:.5,y:30}),false);}});
test('battleships and fighters require close contact before firing',()=>{for(const [type,range] of [['battleship',5],['fighter',4]]){const s=arena(),u=s.add(type,0,0,30),enemy=s.add('bomber',1,range+.1,30);u.heading=0;s.combat(u);assert.equal(s.shots.length,0);enemy.x=range-.1;s.combat(u);assert.equal(s.shots.length,1);assert.equal(operationRanges(u).some(r=>r.kind==='weapon'&&r.radius===(type==='battleship'?9:range)),true);}});
test('silo SAMs are fast against aircraft and warheads and reload in ten game seconds',()=>{for(const targetType of ['bomber','missile']){const s=arena(),u=s.add('silo',0,0,30),target=targetType==='missile'?{id:999,type:'missile',team:1,p:.8,x:8,y:30,hp:1}:s.add('bomber',1,8,30);if(targetType==='missile')s.missiles.push(target);s.combat(u);assert.equal(s.shots[0].speed,1.2);assert.equal(u.cooldown,10);assert.equal(TYPES.silo.range,10);}});
test('nuclear bomber enters silo air defense before releasing its slow, direct payload',()=>{const s=arena(),host=s.add('airbase',0,-20,30),defense=s.add('silo',1,0,30);host.mode='bomber';host.bomberPayload='nuclear';s.random=()=>.999;const bomber=s.launchAircraft(host.id,0,30,{targetId:defense.id}).unit;bomber.hp=bomber.maxHp=100;let firedBeforeDrop=false,released=false;for(let i=0;i<2400&&!released;i++){s.tick(.25);if(s.shots.some(p=>p.sourceId===defense.id)&&bomber.ammo===1)firedBeforeDrop=true;if(s.missiles.length){released=true;assert.ok(distance(bomber,defense)<=1.8+.02);assert.ok(bomber.returning);assert.equal(s.missiles[0].profile,'direct');assert.equal(s.missiles[0].duration,distance({x:s.missiles[0].sx,y:s.missiles[0].sy},defense)/WARHEAD_SPEED.direct);}}assert.ok(firedBeforeDrop);assert.ok(released);assert.equal(nuclearRange(bomber),2);assert.equal(WARHEAD_SPEED.direct,.06);assert.equal(WARHEAD_SPEED.ballistic,.08);});
test('full map view reveals enemy activity without changing radar locks or AI intelligence',()=>{const s=arena(),sub=s.add('submarine',1,80,30),missile={team:1,x:80,y:30};s.add('radar',0,0,30);assert.equal(displayVisible(s,sub,'radar'),false);assert.equal(displayVisible(s,sub,'full'),true);assert.equal(s.visibleTo(sub,0),false);assert.equal(Renderer.prototype.projectileVisible.call({visibilityMode:'full'},s,missile),true);assert.equal(Renderer.prototype.projectileVisible.call({visibilityMode:'radar'},s,missile),false);sub.dead=true;assert.equal(displayVisible(s,sub,'full'),false);});
test('visibility mode persists with a session and rejects unknown settings',()=>{const s=arena(),save={version:1,sim:snapshotSimulation(s),preferences:{volume:0,music:0,difficulty:'standard',visibilityMode:'full'},view:{speed:1,gridMode:'degree',zoom:1,focus:{x:0,y:0}}};assert.doesNotThrow(()=>restoreSimulation(save));assert.equal(save.preferences.visibilityMode,'full');save.preferences.visibilityMode='invalid';assert.throws(()=>validatePreferences(save),/visibility/);});

test('surface fleet radar uses the same twelve-degree boundary for detection and coverage',()=>{
 for(const type of ['battleship','carrier']){
  const s=arena(),ship=s.add(type,0,0,30),enemy=s.add('bomber',1,11.99,30);
  assert.equal(TYPES[type].radar,12);assert.equal(operationRanges(ship).find(r=>r.kind==='radar').radius,12);
  assert.equal(s.radarCovers(enemy,0),true);assert.equal(s.visibleTo(enemy,0),true);
  enemy.x=12.01;assert.equal(s.radarCovers(enemy,0),false);assert.equal(s.visibleTo(enemy,0),false);
 }
 assert.equal(TYPES.submarine.radar,0);
});
