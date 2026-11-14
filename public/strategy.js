import {DEFENSE,WARHEAD_SPEED} from './balance.js';
export const DOCTRINES={strategic:{name:'Strategic command'}};
export const LEGACY_DOCTRINES=['hawk','sentinel','retaliator','opportunist','volatile'];
export const STRATEGY_VERSION=2;
const clamp=x=>Math.max(0,Math.min(1,x));
const delta=(a,b)=>((b-a+540)%360)-180;
const wrap=x=>((x+180)%360+360)%360-180;
const distance=(a,b)=>Math.hypot(delta(a.x,b.x),a.y-b.y);
const ground=u=>['silo','airbase','radar'].includes(u.type);
const live=u=>!u.dead&&!u.landed;
export function createStrategists(factions,seed){return factions.map(f=>({version:STRATEGY_VERSION,doctrine:'strategic',rng:(seed+Math.imul(f.id+1,2654435761))>>>0,grievance:factions.map(()=>0),nuclearAttacked:false,posture:'OBSERVE',rival:null,nextReview:0,nextLaunch:0,launcherId:null,phaseOneAt:null,baseline:null,tension:0,wave:null,waveSequence:0,nextDeploy:0,reason:'Reconnaissance and force deployment.'}));}
export function upgradeStrategists(sim){for(const m of sim.strategists)if(m.version!==STRATEGY_VERSION||m.doctrine!=='strategic'){m.version=STRATEGY_VERSION;m.doctrine='strategic';m.plan=null;m.wave=null;m.waveSequence=0;m.nextReview=0;m.nextLaunch=sim.time+120;m.nextDeploy=0;m.launcherId=null;m.reason='Strategic command active; assembling forces.';}}
export function recordAggression(sim,victim,source,amount,nuclear=false){if(!sim.hostile(victim,source))return;const m=sim.strategists[victim];if(!m)return;m.grievance[source]=clamp((m.grievance[source]||0)+amount);m.nuclearAttacked||=nuclear;if(nuclear)m.nextLaunch=Math.min(m.nextLaunch,sim.time+30);m.nextReview=0;}
export function factionPlan(sim,team){
 const m=sim.strategists[team];if(sim.time<m.nextReview&&m.plan)return m.plan;
 const elapsed=Math.max(0,sim.time-(m.reviewedAt??sim.time));m.reviewedAt=sim.time;m.grievance=m.grievance.map(v=>v*Math.exp(-elapsed/2400));
 const own=sim.units.filter(u=>live(u)&&u.team===team),known=sim.units.filter(u=>live(u)&&sim.hostile(team,u.team)&&(sim.visibleTo(u,team)||ground(u)&&u.knownTo?.[team]));
 const detectedIncoming=sim.missiles.filter(n=>!n.dead&&sim.hostile(team,n.team)&&n.p>.5&&sim.radarCovers(n,team)&&own.some(u=>distance(u,n)<25)),incoming=detectedIncoming.length;for(const n of detectedIncoming)m.grievance[n.team]=Math.max(m.grievance[n.team]||0,.65);
 const rivals=sim.activeTeams().filter(t=>sim.hostile(team,t));
 const center=own[0]||{x:0,y:0},value=t=>{const cities=sim.cities.filter(c=>c.team===t&&!c.dead),near=Math.min(180,...cities.map(c=>distance(center,c)));return (m.grievance[t]||0)*12+known.filter(u=>u.team===t&&ground(u)).length*.15+Math.log2(1+cities.reduce((n,c)=>n+c.pop,0))*.3-near/70+(m.rival===t?.7:0);};
 m.rival=rivals.sort((a,b)=>value(b)-value(a)||a-b)[0]??null;m.baseline??=sim.remaining[team];if(sim.phase>1)m.baseline=Math.max(m.baseline,sim.remaining[team]);
 if(sim.phase===1&&m.phaseOneAt===null){m.phaseOneAt=sim.time;m.nextLaunch=sim.time+(sim.mode==='lab'?30:180);}if(incoming)m.nextLaunch=Math.min(m.nextLaunch,sim.time+30);
 const retaliating=m.nuclearAttacked||sim.strategists.some((v,i)=>i!==team&&sim.allied(team,i)&&v.nuclearAttacked),reserve=Math.floor(m.baseline*(retaliating?.06:.12));
 const nuclear=sim.phase===1&&m.rival!==null&&sim.time>=m.nextLaunch&&sim.remaining[team]>reserve;
 m.posture=nuclear?'STRIKE':incoming?'DEFEND':sim.phase>3?'RECON':'CONTAIN';m.tension=clamp(incoming*.12+Math.max(0,...m.grievance));m.reason=m.wave?'Coordinated strike package underway.':nuclear?'Concentrate fire, saturate defenses, assess damage.':incoming?'Intercept threats and prepare counterstrike.':'Deploy, scout and position strike forces.';
 m.nextReview=sim.time+30;m.plan={posture:m.posture,rival:m.rival,aggression:1,reserve,waveCap:48,incoming,retaliating,nuclear,launcherId:null};return m.plan;
}
export function strikeTargets(sim,u,plan,range=360){
 const known=sim.units.filter(e=>live(e)&&ground(e)&&sim.hostile(u.team,e.team)&&(sim.visibleTo(e,u.team)||e.knownTo?.[u.team]));
 const friendly=[...sim.units.filter(v=>live(v)&&sim.allied(u.team,v.team)),...sim.cities.filter(c=>!c.dead&&sim.allied(u.team,c.team))];
 return [...known,...sim.cities.filter(c=>!c.dead&&c.pop>.1&&sim.hostile(u.team,c.team))].filter(t=>distance(u,t)<=range&&!friendly.some(f=>distance(f,t)<2)).map(t=>{
  const city=!t.type,observed=city||sim.visibleTo(t,u.team),hp=observed?t.hp:({silo:25,airbase:15,radar:1}[t.type]),needed=city?Math.min(4,Math.max(2,Math.ceil(t.pop/5))):Math.ceil(hp/10);
  const committed=sim.missiles.filter(n=>!n.dead&&sim.allied(n.team,u.team)&&distance({x:n.tx,y:n.ty},t)<2).length+sim.units.filter(v=>live(v)&&v.strike&&sim.allied(v.team,u.team)&&distance(v.strike,t)<2).length;
  const defenses=known.filter(v=>v.type==='silo'&&sim.visibleTo(v,u.team)&&v.mode==='defense'&&v.stateTimer<=0&&distance(v,t)<=DEFENSE.range).length;
  const value=city?Math.log2(1+t.pop)*.7:t.type==='silo'?7:t.type==='airbase'?4:2;
  return {target:t,needed,defenses,utility:committed>=needed?-Infinity:value+(t.team===plan.rival?2:0)-committed*1.4-defenses*.25-distance(u,t)/360};
 }).filter(t=>Number.isFinite(t.utility)).sort((a,b)=>b.utility-a.utility);
}
export function deployReserves(sim,team,territories){
 if(sim.mode!=='war'||sim.phase<4)return;const m=sim.strategists[team];if(sim.time<m.nextDeploy)return;m.nextDeploy=sim.time+30;
 const stock=sim.stock[team],region=territories[team],type=['silo','airbase','radar'].find(t=>stock[t]>0);
 if(type){const cities=sim.cities.filter(c=>c.team===team).sort((a,b)=>b.pop-a.pop),centers=[...cities.map(c=>[c.x,c.y]),...region.ground];for(const [x,y] of centers)for(const radius of [0,4,8,12,16])for(let i=0;i<(radius?8:1);i++){const a=i*Math.PI/4;if(sim.deploy(type,wrap(x+Math.cos(a)*radius),y+Math.sin(a)*radius,null,team).ok)return;}}
 const remaining={...stock},types=[];for(let i=0;i<6;i++){const t=['battleship','carrier','submarine'].filter(t=>remaining[t]>0).sort((a,b)=>remaining[b]-remaining[a])[0];if(!t)return;types.push(t);remaining[t]--;}
 const fleetCenters=sim.fleets.filter(f=>f.team===team).map(f=>sim.units.filter(u=>live(u)&&u.fleetId===f.id)).filter(units=>units.length).map(units=>({x:wrap(units[0].x+units.reduce((n,u)=>n+delta(units[0].x,u.x),0)/units.length),y:units.reduce((n,u)=>n+u.y,0)/units.length}));
 for(const [x,y] of region.naval)for(const radius of [0,2.5,5,7.5,10,12.5])for(let i=0;i<(radius?12:1);i++){const a=i*Math.PI/6,p={x:wrap(x+Math.cos(a)*radius),y:y+Math.sin(a)*radius};if(fleetCenters.some(c=>distance(c,p)<2.5))continue;if(sim.deploy(types[0],p.x,p.y,types,team).ok)return;}
}
export function coordinateStrike(sim,team,plan,{nuclearRange,aircraftFuel,modes}){
 const m=sim.strategists[team];if(m.wave){const active=sim.units.some(u=>live(u)&&(u.launchQueue||[]).some(q=>q.waveId===m.wave.id)||live(u)&&u.strike&&u.aiWave===m.wave.id)||sim.missiles.some(n=>!n.dead&&n.waveId===m.wave.id);if(sim.time<m.wave.finishAt&&active)return;m.wave=null;m.nextLaunch=sim.time+60;m.nextReview=0;return;}
 if(!plan.nuclear)return;const own=sim.units.filter(u=>live(u)&&u.team===team&&!u.manualControl&&!u.launchQueue?.length&&!u.strike&&!u.returning&&u.mission!=='defend'&&u.mission!=='naval'),reference=own.find(u=>u.type==='silo')||own[0];if(!reference)return;
 const candidates=strikeTargets(sim,reference,plan);let selection=null;
 for(const entry of candidates){const target=entry.target,sources=[];
  for(const u of own){const d=distance(u,target);let kind,capacity,travel;
   if(['silo','submarine'].includes(u.type)&&u.ammo>0&&d<=nuclearRange(u)){if(u.type==='submarine'&&sim.units.some(e=>live(e)&&sim.hostile(team,e.team)&&['carrier','battleship','submarine'].includes(e.type)&&sim.visibleTo(e,team)&&distance(e,u)<5))continue;kind='nuclear';capacity=Math.min(3,u.ammo);travel=d/WARHEAD_SPEED.ballistic;}
   else if(['airbase','carrier'].includes(u.type)&&u.bombers>0&&u.stockNukes>0&&Math.max(0,d-1.5)*2+18<aircraftFuel('bomber',u.type)){kind='aircraft';capacity=Math.min(3,u.bombers,u.stockNukes);travel=Math.max(0,d-1.7)/.05+Math.min(d,1.7)/WARHEAD_SPEED.direct;}
   else continue;sources.push({u,kind,capacity,travel});
  }
  // Keep some silos defending when real incoming traffic is detected, rather than opening every site.
  if(plan.incoming){const silos=sources.filter(s=>s.u.type==='silo');for(const s of silos.slice(-Math.max(1,Math.ceil(silos.length/3))))sources.splice(sources.indexOf(s),1);}
  const capacity=sources.reduce((n,s)=>n+s.capacity,0),defenses=entry.defenses||2,budget=Math.min(48,sim.remaining[team]-plan.reserve,capacity),desired=Math.min(budget,Math.max(12,entry.needed+defenses*8));
  if(!sources.length||desired<Math.min(6,entry.needed,capacity))continue;selection={entry,sources,desired};break;
 }
 if(!selection){m.nextLaunch=sim.time+60;m.nextReview=0;return;}
 const {entry,sources,desired}=selection,target=entry.target,id=`${team}:${++m.waveSequence}:${sim.time}`,impactAt=sim.time+35+Math.max(...sources.map(s=>s.travel+Math.max(s.u.cooldown,s.u.stateTimer))),launchers=new Set();let assigned=0,lastImpact=impactAt;
 for(let round=0;round<3&&assigned<desired;round++)for(const source of sources){if(round>=source.capacity||assigned>=desired)continue;const {u,kind,travel}=source,arrival=impactAt+round*120,notBefore=arrival-travel;
  const mode=kind==='aircraft'?'bomber':'launch';if(u.mode!==mode){u.mode=mode;u.stateTimer=modes[u.type].find(s=>s.id===mode).prepare;}if(kind==='aircraft')u.bomberPayload='nuclear';u.aiWave=id;u.aiStrike=true;
  u.launchQueue??=[];u.launchQueue.push({kind,payload:kind==='aircraft'?'nuclear':null,x:target.x,y:target.y,targetId:target.type?target.id:null,targetTeam:target.team,cityName:target.type?null:target.name,label:target.type?`${target.type} ${target.id}`:target.name,notBefore,ai:true,waveId:id});assigned++;launchers.add(u.id);lastImpact=arrival;
 }
 // Surfaced missile boats hold their fleet station while the scheduled launches leave the tubes.
 for(const source of sources.filter(s=>s.u.type==='submarine'&&launchers.has(s.u.id))){const fleet=sim.fleets.find(f=>f.id===source.u.fleetId),members=fleet&&sim.units.filter(u=>live(u)&&u.fleetId===fleet.id);if(members?.length){const ref=members[0],center={x:wrap(ref.x+members.reduce((n,u)=>n+delta(ref.x,u.x),0)/members.length),y:members.reduce((n,u)=>n+u.y,0)/members.length};sim.commandFleet(ref,center);}}
 m.wave={id,targetTeam:target.team,targetId:target.id??null,cityName:target.name??null,assigned,launcherIds:[...launchers],impactAt,finishAt:lastImpact+90};m.reason=`Coordinated ${assigned}-warhead strike; ${launchers.size} platforms.`;m.nextReview=0;sim.event(`${sim.factionName(team)} preparing coordinated strike package (${assigned} warheads).`,'alert');
}
export function navalObjective(sim,u,plan,territories){
 const contacts=sim.units.filter(e=>live(e)&&sim.hostile(e.team,u.team)&&['battleship','carrier','submarine'].includes(e.type)&&sim.visibleTo(e,u.team)).sort((a,b)=>distance(u,a)-distance(u,b));
 const weight=v=>v.type==='battleship'?3:v.type==='submarine'?2:1,nearby=sim.units.filter(v=>live(v)&&['battleship','carrier','submarine'].includes(v.type)&&distance(u,v)<12),enemyPower=nearby.filter(v=>sim.hostile(u.team,v.team)&&sim.visibleTo(v,u.team)).reduce((n,v)=>n+weight(v),0),ownPower=nearby.filter(v=>sim.allied(u.team,v.team)).reduce((n,v)=>n+weight(v),0);
 const retreat=enemyPower>ownPower*1.4;
 if(contacts.length&&!retreat)return {x:contacts[0].x,y:contacts[0].y};
 if(retreat||plan.rival===null){const p=territories[u.team].naval[(u.fleetId??u.id)%territories[u.team].naval.length];return {x:p[0],y:p[1]};}
 const target=sim.cities.filter(c=>c.team===plan.rival&&!c.dead).sort((a,b)=>b.pop-a.pop)[(u.fleetId??u.id)%3]||null;
 if(target&&sim.navigation){const points=[];for(const radius of [8,12,16])for(let i=0;i<12;i++){const a=i*Math.PI/6,p={x:wrap(target.x+Math.cos(a)*radius),y:target.y+Math.sin(a)*radius};if(sim.navigation.navigable(p.x,p.y,2))points.push(p);}if(points.length)return points.sort((a,b)=>distance(u,a)-distance(u,b))[0];}
 const p=territories[plan.rival].naval[(u.fleetId??u.id)%territories[plan.rival].naval.length];return {x:p[0],y:p[1]};
}
