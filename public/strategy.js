import {DEFENSE} from './balance.js';
// Utility scoring with persistent plans and seeded variation, not a model of real politics.
export const DOCTRINES={
 hawk:{name:'Forward pressure',aggression:.9,reserve:.25,delay:300,pause:180,noFirstUse:false,noise:.08},
 sentinel:{name:'Defensive restraint',aggression:.18,reserve:.55,delay:1500,pause:540,noFirstUse:true,noise:.04},
 retaliator:{name:'Assured retaliation',aggression:.4,reserve:.45,delay:900,pause:300,noFirstUse:true,noise:.05},
 opportunist:{name:'Opportunistic pressure',aggression:.6,reserve:.4,delay:900,pause:420,noFirstUse:false,noise:.1},
 volatile:{name:'Unstable brinkmanship',aggression:.7,reserve:.3,delay:480,pause:240,noFirstUse:false,noise:.22}
};
const clamp=x=>Math.max(0,Math.min(1,x));
const delta=(a,b)=>((b-a+540)%360)-180;
const distance=(a,b)=>Math.hypot(delta(a.x,b.x),a.y-b.y);
const ground=u=>['silo','airbase','radar'].includes(u.type);
function random(mind){mind.rng=(Math.imul(1664525,mind.rng)+1013904223)>>>0;return mind.rng/4294967296;}
export function createStrategists(factions,seed,playerTeam){const picker={rng:seed>>>0},order=Object.keys(DOCTRINES);for(let i=order.length-1;i>0;i--){const j=Math.floor(random(picker)*(i+1));[order[i],order[j]]=[order[j],order[i]];}let index=0;return factions.map(f=>({doctrine:order[f.id===playerTeam?Math.floor(random(picker)*order.length):index++%order.length],rng:(picker.rng+Math.imul(f.id+1,2654435761))>>>0,grievance:factions.map(()=>0),nuclearAttacked:false,posture:'OBSERVE',rival:null,nextReview:0,nextLaunch:0,launcherId:null,phaseOneAt:null,baseline:null,tension:0,reason:'Awaiting intelligence.'}));}
export function recordAggression(sim,victim,source,amount,nuclear=false){if(!sim.hostile(victim,source))return;const mind=sim.strategists?.[victim];if(!mind)return;mind.grievance[source]=clamp((mind.grievance[source]||0)+amount);mind.nuclearAttacked||=nuclear;if(nuclear)mind.nextLaunch=Math.min(mind.nextLaunch,sim.time+60);mind.nextReview=0;}
export function factionPlan(sim,team){
 const m=sim.strategists[team],d=DOCTRINES[m.doctrine],exercise=sim.mode==='lab';
 if(sim.time<m.nextReview&&m.plan)return m.plan;
 const elapsed=Math.max(0,sim.time-(m.reviewedAt??sim.time));m.reviewedAt=sim.time;m.grievance=m.grievance.map(v=>v*Math.exp(-elapsed/1800));
 const own=sim.units.filter(u=>!u.dead&&!u.landed&&u.team===team),contacts=sim.units.filter(u=>!u.dead&&!u.landed&&sim.hostile(team,u.team)&&sim.visibleTo(u,team));
 const incoming=sim.missiles.filter(n=>!n.dead&&sim.hostile(team,n.team)&&n.p>.5&&sim.radarCovers(n,team)&&own.some(u=>distance(u,n)<25));
 for(const n of incoming)m.grievance[n.team]=Math.max(m.grievance[n.team]||0,.45);
 const alliedHit=sim.strategists.some((v,i)=>i!==team&&sim.allied(team,i)&&v.nuclearAttacked),retaliating=m.nuclearAttacked||alliedHit;
 const pressure=Math.max(0,...m.grievance);m.tension=clamp(m.tension*.65+pressure*.35+incoming.length*.12);
 const rivals=sim.activeTeams().filter(t=>sim.hostile(team,t));
 m.rival=rivals.sort((a,b)=>(m.grievance[b]*8+contacts.filter(u=>u.team===b).length*.05)-(m.grievance[a]*8+contacts.filter(u=>u.team===a).length*.05)||((a+team)%sim.factions.length)-((b+team)%sim.factions.length))[0]??null;
 m.baseline??=sim.remaining[team];if(sim.phase===1&&m.phaseOneAt===null){m.phaseOneAt=sim.time;m.nextLaunch=sim.time+(exercise||retaliating?60:d.delay)*( .8+random(m)*.4);}
 const launchedRivals=contacts.some(u=>u.type==='silo'&&u.launchRevealed),readiness=sim.phase===1&&sim.time>=m.nextLaunch;
 const permission=exercise||retaliating||!d.noFirstUse&&(d.aggression>.65||launchedRivals||m.tension>.3);
 const reserve=Math.ceil(m.baseline*d.reserve*(retaliating?.3:1)),waveCap=retaliating?3:d.aggression>.8?2:1;
 const inFlight=sim.missiles.filter(n=>!n.dead&&n.team===team).length+own.filter(u=>u.strike).length;
 const noise=(random(m)-.5)*d.noise;
 const utility={OBSERVE:.2,RECON:sim.phase<=3?.45+(contacts.length===0?.3:0):.6,DEFEND:.2+(1-d.aggression)*.5+incoming.length*.8,CONTAIN:sim.phase<=3?.35+d.aggression*.4:0,STRIKE:readiness&&permission&&sim.remaining[team]>reserve&&inFlight<waveCap?.9+m.tension+noise:0};
 if(m.posture in utility)utility[m.posture]+=.08;
 const posture=Object.keys(utility).sort((a,b)=>utility[b]-utility[a])[0];
 const launchers=own.filter(u=>(['silo','submarine','bomber'].includes(u.type)&&u.ammo>0||['airbase','carrier'].includes(u.type)&&u.bombers>0&&u.stockNukes>0)&&sim.time>=(u.aiNoTargetUntil??0)&&!u.manualControl&&!u.launchQueue?.length&&!u.strike&&u.mission!=='defend'&&u.mission!=='naval');
 const current=launchers.find(u=>u.id===m.launcherId);m.launcherId=(current||launchers.sort((a,b)=>(a.stateTimer>0)-(b.stateTimer>0)||(a.type===m.lastPlatform)-(b.type===m.lastPlatform)||a.cooldown-b.cooldown||b.hp-a.hp)[0])?.id??null;
 const changed=posture!==m.posture;m.posture=posture;m.reason=incoming.length?'Detected incoming warheads.':retaliating?'Responding to nuclear attacks.':posture==='STRIKE'?'Limited strike window; preserve reserves.':d.noFirstUse?'Hold nuclear fire; protect forces.':'Reconnaissance and measured pressure.';
 m.nextReview=sim.time+(exercise?30:90+random(m)*90);m.plan={posture,rival:m.rival,aggression:d.aggression,reserve,waveCap,incoming:incoming.length,retaliating,nuclear:posture==='STRIKE',launcherId:m.launcherId};
 if(changed&&team===sim.playerTeam&&sim.autopilot)sim.event(`AI command: ${d.name} · ${m.reason}`);
 return m.plan;
}
export function strikeTargets(sim,u,plan,range=360){
 const known=sim.units.filter(e=>!e.dead&&!e.landed&&ground(e)&&sim.hostile(u.team,e.team)&&(sim.visibleTo(e,u.team)||e.knownTo?.[u.team]));
 const targets=[...known,...sim.cities.filter(c=>!c.dead&&c.pop>.1&&sim.hostile(u.team,c.team))],friendly=[...sim.units.filter(v=>!v.dead&&!v.landed&&sim.allied(u.team,v.team)),...sim.cities.filter(c=>!c.dead&&sim.allied(u.team,c.team))];
 return targets.filter(t=>distance(u,t)<=range&&!friendly.some(f=>distance(f,t)<2)).map(t=>{
  const city=!t.type,observed=city||sim.visibleTo(t,u.team),hp=observed?t.hp:({silo:25,airbase:15,radar:1}[t.type]),needed=city?2:Math.ceil(hp/10);
  const committed=sim.missiles.filter(n=>!n.dead&&sim.allied(n.team,u.team)&&distance({x:n.tx,y:n.ty},t)<2).length+sim.units.filter(v=>!v.dead&&v.strike&&sim.allied(v.team,u.team)&&distance(v.strike,t)<2).length;
  const value=city?Math.log2(1+t.pop)*.65:t.type==='silo'?3.6:t.type==='airbase'?2.8:1.8;
  const defense=known.filter(v=>v.type==='silo'&&sim.visibleTo(v,u.team)&&v.mode==='defense'&&v.stateTimer<=0&&distance(v,t)<=DEFENSE.range).length;
  return {target:t,utility:committed>=needed?-Infinity:value+(t.team===plan.rival?.8:0)+(plan.retaliating&&t.type==='silo'?.8:0)-committed*1.4-defense*.25-distance(u,t)/360};
 }).filter(t=>Number.isFinite(t.utility)).sort((a,b)=>b.utility-a.utility);
}
export function noteStrategicLaunch(sim,team){const m=sim.strategists[team],d=DOCTRINES[m.doctrine];m.lastPlatform=sim.units.find(u=>u.id===m.launcherId)?.type??null;m.nextLaunch=sim.time+(sim.mode==='lab'?120:d.pause)*(.8+random(m)*.4);m.launcherId=null;m.nextReview=0;}
export function navalObjective(sim,u,plan,territories){
 const contacts=sim.units.filter(e=>!e.dead&&!e.landed&&sim.hostile(e.team,u.team)&&['battleship','carrier','submarine'].includes(e.type)&&sim.visibleTo(e,u.team)).sort((a,b)=>distance(u,a)-distance(u,b));
 const enemies=contacts.filter(e=>distance(u,e)<18).length,local=sim.units.filter(v=>!v.dead&&sim.allied(v.team,u.team)&&['battleship','carrier','submarine'].includes(v.type)&&distance(u,v)<18).length;
 const retreat=plan.incoming>0||plan.aggression<.5||enemies>local*1.5;
 if(contacts.length&&!retreat)return {x:contacts[0].x,y:contacts[0].y};
 const region=territories[retreat||plan.rival===null?u.team:plan.rival],point=region.naval[(u.fleetId??u.id)%region.naval.length];return {x:point[0],y:point[1]};
}
