import assert from 'node:assert/strict';
import {Simulation,WARHEAD_SPEED,TYPES,distance} from '../public/engine.js';
import {DEFENSE} from '../public/balance.js';
export function strikeTrial({seed=42,count=1,defenders=1,targetX=0,dt=1}={}){
 const s=new Simulation({mode:'lab',left:'radar',right:'radar',seed,count:1});s.units=[];s.fleets=[];s.cities=[];s.ai=()=>{};s.running=s.started=true;let hits=0,interceptions=0;
 for(let i=0;i<defenders;i++)s.add('silo',0,(i-(defenders-1)/2)*6,30);
 s.add('radar',1,-70,30);s.onEffect=type=>{if(type==='nuclear')hits++;};s.onEvent=e=>{if(e.message.includes('Warhead intercepted'))interceptions++;};
 for(let i=0;i<count;i++){const source=s.add('silo',1,-50,30+i*.1);source.mode='launch';assert.ok(s.launch(source.id,targetX,30).ok);}
 const duration=Math.ceil(distance({x:-50,y:30},{x:targetX,y:30})/WARHEAD_SPEED.ballistic)+40;for(let t=0;t<duration&&!s.ended;t+=dt)s.tick(dt);
 return {hits,intercepted:count-hits,alive:s.units.filter(u=>u.team===0&&!u.dead).length};
}
const results=[];
for(const scenario of [{name:'undefended',count:1,defenders:0},{name:'isolated',count:1,defenders:1},{name:'salvo',count:12,defenders:1},{name:'layered',count:12,defenders:3},{name:'outside-coverage',count:1,defenders:1,targetX:30}]){
 let hits=0,intercepted=0;const trials=40;for(let seed=1;seed<=trials;seed++){const r=strikeTrial({...scenario,seed:Math.imul(seed,2654435761)>>>0});hits+=r.hits;intercepted+=r.intercepted;}
 results.push({...scenario,trials,hits,intercepted,penetration:hits/(trials*scenario.count)});
}
const by=name=>results.find(r=>r.name===name);assert.equal(by('undefended').penetration,1);assert.equal(by('outside-coverage').penetration,1);assert.ok(by('isolated').penetration<=.25,'fast-reloading local defense should stop most isolated warheads');assert.ok(by('salvo').penetration>by('isolated').penetration+.15,'simultaneous salvos saturate one battery');assert.ok(by('layered').penetration<by('salvo').penetration-.08,'layered defense improves survival');assert.ok(by('layered').penetration>.03,'three defenses must not be impenetrable');assert.equal(TYPES.silo.range,DEFENSE.range);
console.log(JSON.stringify({passed:true,results}));
