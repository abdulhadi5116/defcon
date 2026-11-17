import test from 'node:test';
import assert from 'node:assert/strict';
import {Simulation,weaponDamage,distance} from '../public/engine.js';
import {WARHEAD_HEALTH,WARHEAD_SPEED} from '../public/balance.js';
import {Renderer,WARHEAD_SHAPES,displayVisible} from '../public/renderer.js';
import {snapshotSimulation,restoreSimulation} from '../public/save-state.js';
const arena=()=>{const s=new Simulation({mode:'lab',left:'radar',right:'radar',count:1});s.units=[];s.fleets=[];s.cities=[];s.ai=()=>{};s.started=s.running=true;s.add('radar',1,150,-50);return s;};
const save=s=>({version:1,sim:snapshotSimulation(s),preferences:{volume:0,music:0,difficulty:'standard'},view:{speed:1,gridMode:'degree',zoom:1,focus:{x:0,y:0}}});
test('silo, submarine and bomber launch distinct warhead profiles with shared AI/runtime speed values',()=>{
 for(const [type,profile,hp,speed,d] of [['silo','ballistic',10,.08,10],['submarine','submarine',6,.12,10],['bomber','direct',10,.06,1]]){const s=arena(),u=s.add(type,0,0,30);u.mode=type==='bomber'?'nuclear':'launch';assert.ok(s.launch(u.id,d,30).ok);const m=s.missiles[0];assert.equal(m.sourceId,u.id);assert.equal(m.sourceType,type);assert.equal(m.profile,profile);assert.equal(m.hp,hp);assert.equal(m.maxHp,hp);assert.equal(m.duration,Math.max(12,d/speed));assert.equal(WARHEAD_SPEED[profile],speed);assert.equal(WARHEAD_HEALTH[profile],hp);}
 assert.ok(WARHEAD_SHAPES.ballistic.length>WARHEAD_SHAPES.submarine.length*1.5);
});
test('ICBMs need ten interceptor hits and submarine warheads six',()=>{
 for(const hp of [10,6]){const s=arena(),u=s.add('silo',0,0,30),m={id:999,type:'missile',team:1,p:.8,x:1,y:30,hp,maxHp:hp};s.missiles.push(m);s.random=()=>0;for(let i=0;i<hp;i++){u.cooldown=0;s.combat(u);assert.equal(s.shots[0].damage,1);s.advanceShots(1);assert.equal(m.hp,hp-i-1);}assert.equal(m.dead,true);assert.ok(s.blasts.some(b=>b.combat&&b.targetMissile&&b.destroyed));}
});
test('all conventional missile matchups deal exactly one HP',()=>{for(const source of ['fighter','silo','battleship'])for(const target of ['carrier','battleship','submarine','fighter','bomber','missile'])assert.equal(weaponDamage({type:source},{type:target},'sam'),1);});
test('legacy in-flight missiles migrate profile, speed and remaining HP fraction without resetting progress',()=>{
 const s=arena(),u=s.add('submarine',0,0,30);u.mode='launch';s.launch(u.id,10,30);const m=s.missiles[0];s.balanceRevision=10;delete m.sourceId;delete m.sourceType;m.profile='ballistic';m.hp=6;m.maxHp=10;m.p=.4;m.duration=10/.06;const r=restoreSimulation(save(s)),copy=r.missiles[0];assert.equal(copy.profile,'submarine');assert.equal(copy.duration,10/.12);assert.equal(copy.p,.4);assert.equal(copy.maxHp,6);assert.ok(Math.abs(copy.hp-3.6)<1e-9);const again=restoreSimulation(save(r));assert.deepEqual(again.missiles,r.missiles);
});
test('enemy interceptor terminal animation is visible near an own warhead while its hidden launcher stays hidden',()=>{
 const s=arena(),source=s.add('silo',1,80,30),target={id:999,type:'missile',team:0,x:10,y:30},renderer={visibilityMode:'radar',unitVisible:(sim,u)=>displayVisible(sim,u,'radar')};s.missiles.push(target);const shot={team:1,targetId:999,targetMissile:true,x:60,y:30};assert.equal(Renderer.prototype.projectileVisible.call(renderer,s,shot),false);shot.x=11.9;assert.equal(Renderer.prototype.projectileVisible.call(renderer,s,shot),true);assert.equal(displayVisible(s,source,'radar'),false);assert.equal(source.knownTo[0],false);target.team=1;assert.equal(Renderer.prototype.projectileVisible.call(renderer,s,shot),false);assert.equal(s.units.filter(u=>s.visible(u)).some(u=>u.id===source.id),false);
});
