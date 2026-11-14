import assert from 'node:assert/strict';
import {Simulation,COMBAT_CHANCES,TYPES} from '../public/engine.js';
const results=[];
for(const [left,right] of [['battleship','carrier'],['submarine','carrier'],['carrier','submarine'],['fighter','bomber'],['fighter','fighter'],['silo','bomber'],['silo','fighter']]){
 let leftLoss=0,rightLoss=0,attempts=0;
 for(let seed=1;seed<=12;seed++){
  const s=new Simulation({mode:'lab',left,right,count:1,seed:Math.imul(seed,2654435761)>>>0});s.running=s.started=true;
  for(let i=0;i<1200&&!s.ended;i++){s.tick(1);attempts+=s.shots.length;for(const u of s.units){assert.ok(Number.isFinite(u.x)&&Number.isFinite(u.y));assert.ok(u.hp<=TYPES[u.type].hp);if(TYPES[u.type].domain==='air')assert.ok(u.fuel>=0);}}
  leftLoss+=s.unitLosses[0];rightLoss+=s.unitLosses[1];
 }
 assert.ok(attempts>0,`${left}/${right}: actual combat must occur`);results.push({left,right,trials:12,leftLoss,rightLoss});
}
assert.equal(COMBAT_CHANCES.silo.fighter,.1);console.log(JSON.stringify({passed:true,results}));
