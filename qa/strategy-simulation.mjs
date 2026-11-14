import assert from 'node:assert/strict';
import {Simulation} from '../public/engine.js';
import {defaultFactions} from '../public/territories.js';
import {snapshotSimulation,validateSnapshot} from '../public/save-state.js';
const results=[];
for(const seed of [42,91]){
 const factions=defaultFactions();factions.forEach((f,i)=>f.active=i<3);const s=new Simulation({seed,factions});s.phase=1;s.phaseStartedAt=0;s.phaseEndsAt=null;s.started=true;s.setAutopilot(true);['hawk','sentinel','opportunist'].forEach((doctrine,i)=>s.strategists[i].doctrine=doctrine);
 const launches=[],hits=[];s.onEffect=(kind,context)=>{if(['launch','enemylaunch'].includes(kind)){const m=s.missiles.at(-1);launches.push({time:s.time,team:m.team});}if(kind==='nuclear')hits.push({time:s.time,victims:s.strategists.map((m,i)=>m.nuclearAttacked?i:null).filter(i=>i!==null)});};
 for(let i=0;i<3600&&!s.ended;i++){s.tick(1);if(i%300===0)validateSnapshot(JSON.parse(JSON.stringify({version:1,sim:snapshotSimulation(s),preferences:{volume:0,music:0,difficulty:'standard'},view:{speed:20,gridMode:'degree',zoom:1,focus:{x:0,y:0}}})));}
 const first=[0,1,2].map(team=>launches.find(l=>l.team===team)?.time??null);assert.ok(first[0]>240,'hawk must stage before first use');assert.ok(launches.length>0);if(first[1]!==null)assert.ok(hits.some(h=>h.time<first[1]&&h.victims.includes(1)),'sentinel must wait for an actual nuclear attack');assert.ok(launches.filter(l=>l.time<600).length<=3,'no opening global salvo');assert.ok(s.remaining[0]>0,'preserve a reserve');results.push({seed,firstLaunchSeconds:first,opening600:launches.filter(l=>l.time<600),launchCount:launches.length,remaining:s.remaining.slice(0,3),units:s.units.length});
}
console.log(JSON.stringify({passed:true,results}));
