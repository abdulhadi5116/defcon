import {DEPLOYMENT_PLANS} from './deployment-plans.js';
import {DEFENSE,NUCLEAR_RELOAD,AIRCRAFT_LAUNCH_INTERVAL,WARHEAD_SPEED,SUBMARINE_NUCLEAR_RANGE,SUBMARINE_ACTIVE_RANGE,FLEET_RADIUS} from './balance.js';
export const DOCTRINES={strategic:{name:'Strategic command'}};
export const LEGACY_DOCTRINES=['hawk','sentinel','retaliator','opportunist','volatile'];
export const STRATEGY_VERSION=4;
const clamp=x=>Math.max(0,Math.min(1,x));
const delta=(a,b)=>((b-a+540)%360)-180;
const wrap=x=>((x+180)%360+360)%360-180;
const distance=(a,b)=>Math.hypot(delta(a.x,b.x),a.y-b.y);
const ground=u=>['silo','airbase','radar'].includes(u.type);
const live=u=>!u.dead&&!u.landed;
export function strategicRandom(m){m.rng=(Math.imul(m.rng,1664525)+1013904223)>>>0;return m.rng/4294967296;}
function draftFleet(stock,m){const remaining={...stock},types=[];for(let i=0;i<6;i++){const choices=['battleship','carrier','submarine'].filter(t=>remaining[t]>0);if(!choices.length)break;const mandatory=i<3?['battleship','carrier','submarine'][i]:null;let type=mandatory&&remaining[mandatory]>0?mandatory:null;if(!type){let pick=strategicRandom(m)*choices.reduce((n,t)=>n+remaining[t],0);type=choices.find(t=>(pick-=remaining[t])<0)||choices.at(-1);}types.push(type);remaining[type]--;}return types;}
export function createStrategists(factions,seed){return factions.map(f=>({version:STRATEGY_VERSION,doctrine:'strategic',rng:(seed+Math.imul(f.id+1,2654435761))>>>0,grievance:factions.map(()=>0),nuclearAttacked:false,counterUntil:0,aggressor:null,posture:'OBSERVE',rival:null,nextReview:0,nextLaunch:0,launcherId:null,phaseOneAt:null,baseline:null,tension:0,wave:null,waves:[],waveSequence:0,nextDeploy:0,reason:'Reconnaissance and force deployment.'}));}
export function upgradeStrategists(sim){for(const m of sim.strategists)if(m.version!==STRATEGY_VERSION||m.doctrine!=='strategic'){m.version=STRATEGY_VERSION;m.doctrine='strategic';m.plan=null;m.waves=Array.isArray(m.waves)?m.waves:m.wave?[m.wave]:[];m.wave=m.waves.at(-1)??null;m.waveSequence??=0;m.nextReview=0;m.nextLaunch=Math.min(m.nextLaunch??sim.time+30,sim.time+30);m.nextDeploy??=0;m.counterUntil??=0;m.aggressor??=null;m.launcherId=null;m.reason='Offensive strategic command active.';}}
export function recordAggression(sim,victim,source,amount,nuclear=false){if(!sim.hostile(victim,source))return;const m=sim.strategists[victim];if(!m)return;m.grievance[source]=clamp((m.grievance[source]||0)+amount);m.nuclearAttacked||=nuclear;m.counterUntil=sim.time+180;m.aggressor=source;m.nextLaunch=Math.min(m.nextLaunch,sim.time+(nuclear?10:20));m.nextReview=0;}
export function factionPlan(sim,team){
 const m=sim.strategists[team];if(sim.time<m.nextReview&&m.plan)return m.plan;
 const elapsed=Math.max(0,sim.time-(m.reviewedAt??sim.time));m.reviewedAt=sim.time;m.grievance=m.grievance.map(v=>v*Math.exp(-elapsed/2400));
 const own=sim.units.filter(u=>live(u)&&u.team===team),known=sim.units.filter(u=>live(u)&&sim.hostile(team,u.team)&&(sim.visibleTo(u,team)||ground(u)&&u.knownTo?.[team]));
 const detectedIncoming=sim.missiles.filter(n=>!n.dead&&sim.hostile(team,n.team)&&n.p>.5&&sim.radarCovers(n,team)&&own.some(u=>distance(u,n)<25)),incoming=detectedIncoming.length;for(const n of detectedIncoming)m.grievance[n.team]=Math.max(m.grievance[n.team]||0,.65);
 const protectedSites=[...own.filter(ground),...sim.cities.filter(c=>c.team===team&&!c.dead)],forwardThreats=known.filter(e=>!ground(e)&&protectedSites.some(p=>distance(e,p)<=20));for(const e of forwardThreats)m.grievance[e.team]=Math.max(m.grievance[e.team]||0,.4);
 const countering=(m.counterUntil??0)>sim.time&&sim.hostile(team,m.aggressor),pressure=incoming+forwardThreats.length+(countering?1:0),rivals=sim.activeTeams().filter(t=>sim.hostile(team,t));
 const center=own[0]||{x:0,y:0},value=t=>{const cities=sim.cities.filter(c=>c.team===t&&!c.dead),near=Math.min(180,...cities.map(c=>distance(center,c)));return (m.grievance[t]||0)*12+(countering&&m.aggressor===t?8:0)+known.filter(u=>u.team===t&&ground(u)).length*.15+Math.log2(1+cities.reduce((n,c)=>n+c.pop,0))*.3-near/70+(m.rival===t?.7:0);};
 m.rival=rivals.sort((a,b)=>value(b)-value(a)||a-b)[0]??null;m.baseline??=sim.remaining[team];if(sim.phase>1)m.baseline=Math.max(m.baseline,sim.remaining[team]);
 if(sim.phase===1&&m.phaseOneAt===null){m.phaseOneAt=sim.time;m.nextLaunch=sim.time+(sim.mode==='lab'?10:45+strategicRandom(m)*120);}if(pressure)m.nextLaunch=Math.min(m.nextLaunch,sim.time+10);
 const retaliating=m.nuclearAttacked||sim.strategists.some((v,i)=>i!==team&&sim.allied(team,i)&&v.nuclearAttacked),reserve=Math.floor(m.baseline*(retaliating?.02:.06));
 const nuclear=sim.phase===1&&m.rival!==null&&sim.time>=m.nextLaunch&&sim.remaining[team]>reserve;
 m.posture=nuclear?'STRIKE':incoming?'DEFEND':sim.phase>3?'RECON':'CONTAIN';m.tension=clamp(incoming*.12+Math.max(0,...m.grievance));m.reason=m.wave?'Coordinated strike package underway.':nuclear?'Concentrate fire, saturate defenses, assess damage.':incoming?'Intercept threats and prepare counterstrike.':'Deploy, scout and position strike forces.';
 m.nextReview=sim.time+10;m.plan={posture:m.posture,rival:m.rival,aggression:1,reserve,waveCap:72,incoming,pressure,retaliating,nuclear,launcherId:null};return m.plan;
}
export function strikeTargets(sim,u,plan,range=360){
 const known=sim.units.filter(e=>live(e)&&ground(e)&&sim.hostile(u.team,e.team)&&(sim.visibleTo(e,u.team)||e.knownTo?.[u.team]));
 const friendly=[...sim.units.filter(v=>live(v)&&sim.allied(u.team,v.team)),...sim.cities.filter(c=>!c.dead&&sim.allied(u.team,c.team))];
 let targets=[...known,...sim.cities.filter(c=>!c.dead&&c.pop>.1&&sim.hostile(u.team,c.team))];if((plan.retaliating||plan.pressure||plan.incoming)&&targets.some(t=>t.team===plan.rival))targets=targets.filter(t=>t.team===plan.rival);
 return targets.filter(t=>distance(u,t)<=range&&!friendly.some(f=>distance(f,t)<2)).map(t=>{
  const city=!t.type,observed=city||sim.visibleTo(t,u.team),hp=observed?t.hp:({silo:30,airbase:20,radar:6}[t.type]),needed=city?Math.min(4,Math.max(2,Math.ceil(t.pop/5))):Math.ceil(hp/10);
  const committed=sim.missiles.filter(n=>!n.dead&&sim.allied(n.team,u.team)&&distance({x:n.tx,y:n.ty},t)<2).length+sim.units.filter(v=>live(v)&&v.strike&&sim.allied(v.team,u.team)&&distance(v.strike,t)<2).length;
  const defenses=known.filter(v=>v.type==='silo'&&sim.visibleTo(v,u.team)&&v.mode==='defense'&&v.stateTimer<=0&&distance(v,t)<=DEFENSE.range).length;
  const value=city?Math.log2(1+t.pop)*.7:t.type==='silo'?7:t.type==='airbase'?4:2;
  return {target:t,needed,defenses,utility:committed>=needed?-Infinity:value+(t.team===plan.rival?2:0)-committed*1.4-defenses*.25-distance(u,t)/360};
 }).filter(t=>Number.isFinite(t.utility)).sort((a,b)=>b.utility-a.utility);
}
// AI spawns need room to turn the whole formation and leave the coast without a fine-grid rescue.
function deploymentExit(sim,p){const nav=sim.navigation;if(!nav)return true;if(!nav.navigable(p.x,p.y,2.25)||nav.fleetPlacement&&!nav.fleetPlacement(p.x,p.y))return false;return Array.from({length:16},(_,i)=>{const a=i*Math.PI/8;return {x:wrap(p.x+Math.cos(a)*8),y:p.y+Math.sin(a)*8};}).some(q=>nav.navigable(q.x,q.y,2.25)&&nav.clear(p,q,2.25));}
function waterObjective(sim,p){const nav=sim.navigation;if(!nav||nav.navigable(p.x,p.y,2.1))return p;for(const r of [1,2,4,6,8])for(let i=0;i<16;i++){const a=i*Math.PI/8,q={x:wrap(p.x+Math.cos(a)*r),y:p.y+Math.sin(a)*r};if(nav.navigable(q.x,q.y,2.1))return q;}return p;}
export function deployReserves(sim,team,territories){
 if(sim.mode!=='war'||sim.phase<4)return;const stock=sim.stock[team];if(!Object.values(stock).some(n=>n>0))return;const m=sim.strategists[team];if(sim.time<m.nextDeploy&&sim.time>30)return;m.nextDeploy=sim.time+10;
 m.deploymentSalt??=Math.floor(strategicRandom(m)*4294967296);const noise=p=>{let n=Math.imul(Math.round(p.x*1000)^m.deploymentSalt,2246822519)^Math.imul(Math.round(p.y*1000),3266489917);return (n>>>0)/4294967296;};const region=territories[team];if(sim.time<=30&&!sim.preparingDeploymentPlan&&DEPLOYMENT_PLANS[region.id]){for(const p of DEPLOYMENT_PLANS[region.id]){const fleet=p.fleet?draftFleet(stock,m):null;if(fleet&&fleet.length!==6)continue;const candidates=Array.from({length:16},()=>{const a=strategicRandom(m)*Math.PI*2,r=.4+strategicRandom(m)*(fleet?3.6:2.2);return {x:wrap(p.x+Math.cos(a)*r),y:p.y+Math.sin(a)*r};});candidates.push(p);for(const q of candidates){if(fleet&&!deploymentExit(sim,q))continue;if(fleet&&sim.fleets.filter(f=>f.team===team).some(f=>{const ship=sim.units.find(u=>u.fleetId===f.id);return ship&&distance(ship,q)<3;}))continue;if(sim.deploy(p.type,q.x,q.y,fleet,team).ok)break;}}if(!Object.values(stock).some(n=>n>0))return;}const cities=sim.cities.filter(c=>c.team===team).sort((a,b)=>b.pop-a.pop),own=()=>sim.units.filter(u=>live(u)&&u.team===team),legal=(p,sea)=>sim.territoryMap.contains(region.id,p.x,p.y,sea)&&(!sim.navigation||(sea?sim.navigation.navigable(p.x,p.y):sim.navigation.land(p.x,p.y)));
 sim.deploymentSites??=new Map();let sites=sim.deploymentSites.get(team);if(!sites){const land=[],sea=[],seen=new Set(),add=(x,y,list,naval)=>{const p={x:wrap(x),y},key=naval+':'+p.x.toFixed(2)+':'+p.y.toFixed(2);if(seen.has(key))return;seen.add(key);if(!legal(p,naval)||naval&&!deploymentExit(sim,p))return;if(naval&&Array.from({length:6},(_,i)=>({x:wrap(p.x+Math.cos(-Math.PI/2+i*Math.PI/3)*FLEET_RADIUS),y:p.y+Math.sin(-Math.PI/2+i*Math.PI/3)*FLEET_RADIUS})).some(q=>!legal(q,true)))return;list.push(p);};
  for(const [x,y] of [...region.ground,...cities.map(c=>[c.x,c.y])])for(const r of [0,4,8,12,16])for(let i=0;i<(r?8:1);i++){const a=i*Math.PI/4;add(x+Math.cos(a)*r,y+Math.sin(a)*r,land,false);}
  for(const [x,y] of region.naval)for(const r of [0,2.5,5,7.5,10,12.5])for(let i=0;i<(r?12:1);i++){const a=i*Math.PI/6;add(x+Math.cos(a)*r,y+Math.sin(a)*r,sea,true);}
  // Coastal city candidates expose both ocean fronts instead of only the seed ports.
  for(const c of cities)for(const r of [6,10,16])for(let i=0;i<12;i++){const a=i*Math.PI/6;add(c.x+Math.cos(a)*r,c.y+Math.sin(a)*r,sea,true);}
  sites={land,sea};sim.deploymentSites.set(team,sites);
 }
 for(let n=0;n<24;n++){const type=['radar','silo','airbase'].filter(t=>stock[t]>0).sort((a,b)=>stock[b]-stock[a])[0];if(!type)break;const buildings=own().filter(ground),peers=buildings.filter(u=>u.type===type),score=p=>noise(p)*5+Math.min(18,...peers.map(u=>distance(p,u)))*2+Math.min(8,...buildings.map(u=>distance(p,u)))+cities.reduce((sum,c)=>sum+Math.log1p(c.pop)/(1+distance(c,p)/8),0);const candidates=sites.land.filter(p=>buildings.every(u=>distance(p,u)>=3)).sort((a,b)=>score(b)-score(a));if(!candidates.some(p=>sim.deploy(type,p.x,p.y,null,team).ok)){const fallback=sites.land.filter(p=>buildings.every(u=>distance(p,u)>=1.5)).sort((a,b)=>score(b)-score(a));if(!fallback.some(p=>sim.deploy(type,p.x,p.y,null,team).ok))break;}}
 for(let n=0;n<8;n++){const types=draftFleet(stock,m);if(types.length!==6)break;const centers=sim.fleets.filter(f=>f.team===team).map(f=>own().filter(u=>u.fleetId===f.id)).filter(a=>a.length).map(a=>({x:wrap(a[0].x+a.reduce((n,u)=>n+delta(a[0].x,u.x),0)/a.length),y:a.reduce((n,u)=>n+u.y,0)/a.length}));const score=p=>Math.min(180,...centers.map(c=>distance(c,p)))+noise(p)*10;const candidates=sites.sea.filter(p=>score(p)>=2.5).sort((a,b)=>score(b)-score(a));if(!candidates.some(p=>sim.deploy(types[0],p.x,p.y,types,team).ok))break;}
}
export function coordinateStrike(sim,team,plan,{nuclearRange,aircraftFuel,modes,bomberSpeed}){
 const m=sim.strategists[team];m.waves??=m.wave?[m.wave]:[];m.waves=m.waves.filter(w=>sim.time<w.finishAt&&(sim.units.some(u=>live(u)&&((u.launchQueue||[]).some(q=>q.waveId===w.id)||u.strike&&u.aiWave===w.id))||sim.missiles.some(n=>!n.dead&&n.waveId===w.id)));m.wave=m.waves.at(-1)??null;
 if(!plan.nuclear)return;const own=sim.units.filter(u=>live(u)&&u.team===team&&!u.manualControl&&!u.launchQueue?.length&&!u.strike&&!u.returning&&u.mission!=='defend'&&u.mission!=='naval'&&(!['carrier','airbase'].includes(u.type)||(u.aiDefenseUntil??0)<=sim.time)),reference=own.find(u=>u.type==='silo')||own[0];if(!reference)return;
 const candidates=strikeTargets(sim,reference,plan);let selection=null;
 for(const entry of candidates){const target=entry.target,sources=[];
  for(const u of own){const d=distance(u,target);let kind,capacity,travel;
   if(['silo','submarine'].includes(u.type)&&u.ammo>0&&d<=nuclearRange(u)){if(u.type==='submarine'&&sim.units.some(e=>live(e)&&sim.hostile(team,e.team)&&['carrier','battleship','submarine'].includes(e.type)&&sim.visibleTo(e,team)&&distance(e,u)<SUBMARINE_ACTIVE_RANGE))continue;kind='nuclear';capacity=Math.min(3,u.ammo);travel=Math.max(.1,d/WARHEAD_SPEED[u.type==='submarine'?'submarine':'ballistic']);}
   else if(['airbase','carrier'].includes(u.type)&&u.bombers>0&&u.stockNukes>0&&Math.max(0,d-1.5)*2+18<aircraftFuel('bomber',u.type)){kind='aircraft';capacity=Math.min(3,u.bombers,u.stockNukes);travel=Math.max(0,d-nuclearRange({type:'bomber'}))/bomberSpeed+Math.min(d,nuclearRange({type:'bomber'}))/WARHEAD_SPEED.direct;}
   else continue;sources.push({u,kind,capacity,travel});
  }
  // Keep some silos defending when real incoming traffic is detected, rather than opening every site.
  if(plan.incoming){const silos=sources.filter(s=>s.u.type==='silo');for(const s of silos.slice(-Math.max(1,Math.ceil(silos.length/3))))sources.splice(sources.indexOf(s),1);}
  if(m.waves.length&&sources.length<Math.min(plan.pressure||plan.retaliating?2:3,m.wave?.launcherIds.length||1))continue;
  const reserved=sim.units.filter(u=>live(u)&&u.team===team).reduce((n,u)=>n+(u.launchQueue||[]).filter(q=>q.kind==='nuclear'||q.kind==='aircraft'&&q.payload==='nuclear').length+(u.type==='bomber'&&u.homeId?u.ammo:0),0),capacity=sources.reduce((n,s)=>n+s.capacity,0),defenses=entry.defenses||2,budget=Math.min(plan.waveCap??72,sim.remaining[team]-plan.reserve-reserved,capacity),desired=Math.min(budget,Math.max(plan.pressure||plan.retaliating?18:12,entry.needed+defenses*(plan.retaliating?12:8)));
  if(!sources.length||desired<Math.min(6,entry.needed,capacity))continue;selection={entry,sources,desired};break;
 }
 if(!selection){m.nextLaunch=sim.time+20;m.nextReview=0;return;}
 const {entry,sources,desired}=selection,target=entry.target,id=`${team}:${++m.waveSequence}:${sim.time}`,impactAt=sim.time+35+Math.max(...sources.map(s=>{const mode=s.kind==='aircraft'?'bomber':'launch',preparation=s.u.mode===mode?s.u.stateTimer:modes[s.u.type].find(m=>m.id===mode).prepare;return s.travel+Math.max(s.u.cooldown,preparation);})),launchers=new Set();let assigned=0,lastImpact=impactAt;
 const salvoInterval=Math.max(...sources.map(s=>s.kind==='nuclear'?NUCLEAR_RELOAD[s.u.type]:AIRCRAFT_LAUNCH_INTERVAL[s.u.type].bomber));
 for(let round=0;round<3&&assigned<desired;round++)for(const source of sources){if(round>=source.capacity||assigned>=desired)continue;const {u,kind,travel}=source,arrival=impactAt+round*salvoInterval,notBefore=arrival-travel;
  const mode=kind==='aircraft'?'bomber':'launch';if(u.mode!==mode){u.mode=mode;u.stateTimer=modes[u.type].find(s=>s.id===mode).prepare;}if(kind==='aircraft')u.bomberPayload='nuclear';u.aiWave=id;u.aiStrike=true;
  u.launchQueue??=[];u.launchQueue.push({kind,payload:kind==='aircraft'?'nuclear':null,x:target.x,y:target.y,targetId:target.type?target.id:null,targetTeam:target.team,cityName:target.type?null:target.name,label:target.type?`${target.type} ${target.id}`:target.name,notBefore,ai:true,waveId:id});assigned++;launchers.add(u.id);lastImpact=arrival;
 }
 // Surfaced missile boats hold their fleet station while the scheduled launches leave the tubes.
 for(const source of sources.filter(s=>s.u.type==='submarine'&&launchers.has(s.u.id))){const fleet=sim.fleets.find(f=>f.id===source.u.fleetId),members=fleet&&sim.units.filter(u=>live(u)&&u.fleetId===fleet.id);if(members?.length){const ref=members[0],center={x:wrap(ref.x+members.reduce((n,u)=>n+delta(ref.x,u.x),0)/members.length),y:members.reduce((n,u)=>n+u.y,0)/members.length};sim.commandFleet(ref,center);}}
 m.wave={id,targetTeam:target.team,targetId:target.id??null,cityName:target.name??null,assigned,launcherIds:[...launchers],impactAt,finishAt:lastImpact+90};m.waves.push(m.wave);m.nextLaunch=sim.time+(plan.pressure||plan.retaliating?10:30+strategicRandom(m)*45);m.reason=`Coordinated ${assigned}-warhead strike; ${launchers.size} platforms.`;m.nextReview=0;sim.event(`${sim.factionName(team)} preparing coordinated strike package (${assigned} warheads).`,'alert');
}
function navalStation(sim,u,plan,territories,preferredCity=null){
 if(plan.rival===null){const p=territories[u.team].naval[(u.fleetId??u.id)%territories[u.team].naval.length];return {x:p[0],y:p[1]};}
 const cities=sim.cities.filter(c=>c.team===plan.rival&&!c.dead).sort((a,b)=>(b.name===preferredCity)-(a.name===preferredCity)||b.pop-a.pop),members=u.fleetId?sim.units.filter(v=>live(v)&&v.fleetId===u.fleetId):[u],subs=members.filter(v=>v.type==='submarine'&&v.ammo>0);
 if(sim.navigation&&subs.length&&sim.phase===1){
  if(sim.coastalNavigation!==sim.navigation){sim.coastalNavigation=sim.navigation;sim.coastalStations=new Map();}
  const center={x:wrap(members[0].x+members.reduce((n,v)=>n+delta(members[0].x,v.x),0)/members.length),y:members.reduce((n,v)=>n+v.y,0)/members.length},offset=preferredCity?0:(u.fleetId??u.id)%Math.min(3,cities.length||1);
  for(const city of [...cities.slice(offset),...cities.slice(0,offset)]){const key=`${city.team}:${city.name}:${city.x}:${city.y}`;let points=sim.coastalStations.get(key);if(!points){points=[];for(const radius of [SUBMARINE_NUCLEAR_RANGE*.75,SUBMARINE_NUCLEAR_RANGE*.85,SUBMARINE_NUCLEAR_RANGE*.95])for(let i=0;i<16;i++){const a=i*Math.PI/8,p={x:wrap(city.x+Math.cos(a)*radius),y:city.y+Math.sin(a)*radius};if(sim.navigation.navigable(p.x,p.y,2))points.push(p);}sim.coastalStations.set(key,points);}const usable=points.map(p=>{const slot=subs[0].formationSlot??0,formationAngle=Math.atan2(city.y-p.y,delta(p.x,city.x))-(-Math.PI/2+slot*Math.PI/3);return {...p,formationAngle};}).filter(p=>subs.some(sub=>{const a=-Math.PI/2+(sub.formationSlot??0)*Math.PI/3+p.formationAngle;return distance({x:wrap(p.x+Math.cos(a)*FLEET_RADIUS),y:p.y+Math.sin(a)*FLEET_RADIUS},city)<=SUBMARINE_NUCLEAR_RANGE-.05;}));if(usable.length)return usable.sort((a,b)=>distance(u,a)-distance(u,b))[0];}
 }
 const target=(preferredCity?cities[0]:cities[(u.fleetId??u.id)%3])||null;
 if(target&&sim.navigation){const points=[];for(const radius of [4,8,12])for(let i=0;i<12;i++){const a=i*Math.PI/6,p={x:wrap(target.x+Math.cos(a)*radius),y:target.y+Math.sin(a)*radius};if(sim.navigation.navigable(p.x,p.y,2))points.push(p);}if(points.length)return points.sort((a,b)=>distance(u,a)-distance(u,b))[0];}
 const p=territories[plan.rival].naval[(u.fleetId??u.id)%territories[plan.rival].naval.length];return {x:p[0],y:p[1]};
}

export function navalRecoveryObjective(sim,u){
 const nav=sim.navigation;if(!nav)return null;const members=u.fleetId?sim.units.filter(v=>live(v)&&v.fleetId===u.fleetId):[u],center={x:wrap(u.x+members.reduce((n,v)=>n+delta(u.x,v.x),0)/members.length),y:members.reduce((n,v)=>n+v.y,0)/members.length};
 for(const r of [4,8,12])for(let i=0;i<16;i++){const a=i*Math.PI/8,p={x:wrap(center.x+Math.cos(a)*r),y:center.y+Math.sin(a)*r};if(deploymentExit(sim,p)&&(nav.land(center.x,center.y)||nav.clear(center,p,.09)))return p;}return null;
}
export function navalObjective(sim,u,plan,territories){
 const fleet=sim.fleets.find(f=>f.id===u.fleetId),scope=fleet||u,m=sim.strategists[u.team],members=fleet?sim.units.filter(v=>live(v)&&v.fleetId===fleet.id):[u],ships=sim.units.filter(v=>live(v)&&['battleship','carrier','submarine'].includes(v.type));
 const power=v=>(v.type==='battleship'?3:v.type==='submarine'?2:1)*(.3+.7*Math.max(0,v.hp)/(v.maxHp||v.hp||1)),ownPower=ships.filter(v=>sim.allied(u.team,v.team)&&distance(u,v)<9).reduce((n,v)=>n+power(v)*(members.includes(v)?1:.35),0),contacts=ships.filter(v=>sim.hostile(u.team,v.team)&&sim.visibleTo(v,u.team)),near=contacts.filter(v=>distance(u,v)<12),enemyPower=Math.max(0,...near.map(c=>near.filter(v=>distance(v,c)<9).reduce((n,v)=>n+power(v),0))),protectedSites=[...sim.cities.filter(c=>c.team===u.team),...sim.units.filter(v=>live(v)&&v.team===u.team&&ground(v))];
 const homeThreat=contacts.find(v=>protectedSites.some(p=>distance(p,v)<(p.type?10:20))),responders=sim.fleets.filter(f=>f.team===u.team).map(f=>({f,leader:ships.find(v=>v.fleetId===f.id)})).filter(r=>r.leader).sort((a,b)=>homeThreat?distance(a.leader,homeThreat)-distance(b.leader,homeThreat):0),homeResponse=homeThreat&&(!fleet||responders[0]?.f===fleet),emergency=near.some(v=>distance(u,v)<(v.type==='battleship'?9:5)||members.some(own=>v.target===own.id))||homeResponse;
 const mission=scope.aiMission,commit=(kind,objective,targetId=null)=>{objective=waterObjective(sim,objective);scope.aiMission={kind,objective:{...objective},targetId,phase:sim.phase,until:sim.time+120+strategicRandom(m)*120};return objective;};
 if(near.length&&enemyPower>ownPower*1.35){
  const threat=near.slice().sort((a,b)=>distance(u,a)-distance(u,b))[0],support=sim.fleets.filter(f=>f.team===u.team&&f!==fleet).map(f=>ships.filter(v=>v.fleetId===f.id)).filter(a=>a.length).map(a=>({x:wrap(a[0].x+a.reduce((n,v)=>n+delta(a[0].x,v.x),0)/a.length),y:a.reduce((n,v)=>n+v.y,0)/a.length})).filter(p=>distance(p,threat)>distance(u,threat)+2).sort((a,b)=>distance(u,a)-distance(u,b));
  const d=distance(u,threat)||1,objective=support[0]||{x:wrap(u.x+delta(threat.x,u.x)/d*6),y:u.y+(u.y-threat.y)/d*6};return commit('WITHDRAW',objective,threat.id);
 }
 // The nearest combat-capable reserve reinforces an attacked allied fleet instead of keeping a remote patrol.
 const distressed=ships.filter(v=>sim.allied(u.team,v.team)&&v.fleetId!==u.fleetId&&distance(u,v)<28&&contacts.some(e=>e.target===v.id||e.engageTargetId===v.id));
 if(distressed.length&&members.some(v=>v.type==='battleship'||v.type==='submarine'&&v.mode==='active')){
  const ally=distressed.sort((a,b)=>distance(u,a)-distance(u,b))[0],threat=contacts.filter(e=>distance(e,ally)<12).sort((a,b)=>distance(a,ally)-distance(b,ally))[0];
  const reserves=sim.fleets.filter(f=>f.team===u.team&&f.id!==ally.fleetId).map(f=>({f,units:ships.filter(v=>v.fleetId===f.id)})).filter(r=>r.units.some(v=>v.type==='battleship'||v.type==='submarine'&&v.mode==='active')).sort((a,b)=>distance(a.units[0],ally)-distance(b.units[0],ally));
  if(threat&&reserves[0]?.f===fleet){const d=distance(ally,threat)||1;return commit('REINFORCE',{x:wrap(ally.x+delta(ally.x,threat.x)/d*2),y:ally.y+(threat.y-ally.y)/d*2},threat.id);}
 }
 if(mission&&mission.phase===sim.phase&&mission.until>sim.time&&!emergency&&!['ENGAGE','REINFORCE','WITHDRAW'].includes(mission.kind)&&distance(u,mission.objective)>1)return {...mission.objective};
 const opportunities=contacts.filter(v=>distance(u,v)<12&&ships.filter(e=>sim.hostile(u.team,e.team)&&sim.visibleTo(e,u.team)&&distance(e,v)<9).reduce((n,e)=>n+power(e),0)<ownPower*1.2).map(v=>{const assigned=sim.fleets.filter(f=>f!==fleet&&f.team===u.team&&f.aiMission?.targetId===v.id&&f.aiMission.until>sim.time).length;return {v,score:(v.type==='carrier'?6:v.type==='submarine'?4:3)-distance(u,v)*.15-assigned*3};}).sort((a,b)=>b.score-a.score);
 if(opportunities.length){const target=opportunities[0].v,range=members.some(v=>v.type==='battleship')?7.5:members.some(v=>v.type==='submarine')?3.3:11,d=distance(u,target)||1;return commit('ENGAGE',{x:wrap(target.x+delta(target.x,u.x)/d*range),y:target.y+(u.y-target.y)/d*range},target.id);}
 const homeRange=members.some(v=>v.type==='battleship')?7.5:3.3;if(homeResponse&&distance(u,homeThreat)>12){const d=distance(u,homeThreat);return commit('SCREEN',{x:wrap(homeThreat.x+delta(homeThreat.x,u.x)/d*homeRange),y:homeThreat.y+(u.y-homeThreat.y)/d*homeRange},homeThreat.id);}
 const cities=sim.cities.filter(c=>c.team===plan.rival&&!c.dead).sort((a,b)=>b.pop-a.pop),target=cities[Math.floor(strategicRandom(m)*Math.min(3,cities.length))];
 const screening=plan.incoming>0||!members.some(v=>v.type==='submarine'&&v.ammo>0)&&strategicRandom(m)<.3;
 if(screening){const ports=territories[u.team].naval,used=sim.fleets.filter(f=>f!==fleet&&f.team===u.team&&f.aiMission?.kind==='SCREEN'),ranked=ports.map(p=>({x:p[0],y:p[1]})).map(p=>({p,score:protectedSites.reduce((n,c)=>n+Math.log1p(c.pop||2)/(1+distance(p,c)/8),0)-used.reduce((n,f)=>n+8/(1+distance(p,f.aiMission.objective)),0)-distance(u,p)/50})).sort((a,b)=>b.score-a.score);if(ranked.length)return commit('SCREEN',ranked[0].p);}
 return commit(sim.phase===1&&members.some(v=>v.type==='submarine'&&v.ammo>0)?'STRIKE':'RECON',navalStation(sim,u,plan,territories,target?.name));
}

export function airPatrolObjective(sim,host,fuel=50){
 const saved=host.aiPatrol;if(saved&&saved.until>sim.time&&distance(host,saved)<fuel*.35)return {x:saved.x,y:saved.y};const m=sim.strategists[host.team],fighters=sim.units.filter(u=>live(u)&&u.type==='fighter'&&sim.allied(host.team,u.team)),cities=sim.cities.filter(c=>c.team===host.team&&!c.dead&&distance(host,c)<fuel*.28),score=c=>Math.log1p(c.pop)/(1+distance(host,c)/8)-fighters.filter(f=>distance(f,c)<6).length*.6;
 const ranked=cities.sort((a,b)=>score(b)-score(a)),city=ranked[Math.floor(strategicRandom(m)*Math.min(3,ranked.length))],a=strategicRandom(m)*Math.PI*2,r=city?1.5:6+strategicRandom(m)*4,anchor=city||host;
 const point={x:wrap(anchor.x+Math.cos(a)*r),y:Math.max(-75,Math.min(80,anchor.y+Math.sin(a)*r))};host.aiPatrol={...point,until:sim.time+120+strategicRandom(m)*120};return point;
}

// Shared radar contacts direct patrols; local auto-acquisition alone cannot respond to distant raids.
export function airResponseTarget(sim,aircraft,home=null){
 const sites=[...sim.cities.filter(c=>c.team===aircraft.team),...sim.units.filter(u=>live(u)&&u.team===aircraft.team&&ground(u))];
 const assignments=new Map();for(const v of sim.units)if(v!==aircraft&&live(v)&&v.team===aircraft.team&&v.engageTargetId!=null)assignments.set(v.engageTargetId,(assignments.get(v.engageTargetId)||0)+1);
 const candidates=[...sim.missiles,...sim.units].filter(e=>live(e)&&sim.hostile(aircraft.team,e.team)&&sim.canTarget(aircraft,e)).map(e=>{
  const missile=e.type==='missile',air=['fighter','bomber'].includes(e.type),sea=['carrier','battleship','submarine'].includes(e.type);
  if(!missile&&!air&&!sea)return null;
  const d=distance(aircraft,e),homeThreat=sites.some(p=>distance(p,missile?{x:e.tx,y:e.ty}:e)<(missile?6:20));
  if(!homeThreat&&d>12)return null;
  if(home&&d+distance(e,home)+4>(aircraft.fuel??Infinity))return null;
  const assigned=assignments.get(e.id)||0;
  const priority=missile?30:air?20:e.type==='submarine'&&e.mode==='launch'?17:12;
  return {target:e,score:priority+(homeThreat?4:0)-d*.3-assigned*2+(aircraft.engageTargetId===e.id?2:0)};
 }).filter(Boolean).sort((a,b)=>b.score-a.score);
 return candidates[0]?.target??null;
}
export function coordinateAirResponse(sim,team,modes,aircraftFuel){
 if(sim.phase>3)return;
 for(const u of sim.units.filter(v=>live(v)&&v.team===team&&!v.manualControl)){
  if(['airbase','carrier'].includes(u.type)){
   const probe={...u,type:'fighter',mode:'combat',stateTimer:0,fuel:aircraftFuel('fighter',u.type)},threat=airResponseTarget(sim,probe,u);
   if(!threat)continue;u.aiDefenseUntil=sim.time+30;
   if(threat.type==='missile'||['fighter','bomber'].includes(threat.type)){
    // Cancel only the AI's scheduled offensive sorties, never a player's commands.
    u.launchQueue=(u.launchQueue||[]).filter(q=>!q.ai);u.aiStrike=false;
    if(u.fighters>0&&u.mode!=='fighter'){u.mode='fighter';u.stateTimer=modes[u.type].find(m=>m.id==='fighter').prepare;}
   }
  }else if(['fighter','bomber'].includes(u.type)&&!u.returning&&!u.waitingForHome&&!u.strike&&u.mode!=='nuclear'&&u.stateTimer<=0){
   if(u.type==='bomber'&&(u.bombs??0)<=0)continue;
   const home=sim.units.find(v=>v.id===u.homeId&&!v.dead),target=airResponseTarget(sim,u,home);
   if(target){u.target=u.engageTargetId=target.id;u.aiOrderUntil=sim.time+30;}
  }
 }
}
