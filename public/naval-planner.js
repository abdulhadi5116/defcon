// Geometry stays off the simulation/render thread; one pending order per fleet wins.
export class NavalPlanner {
 constructor(land,{workerFactory=()=>new Worker(new URL('./naval-worker.js',import.meta.url),{type:'module'})}={}){this.next=0;this.jobs=new Map();this.queue=[];this.workers=Array.from({length:2},()=>{const slot={worker:workerFactory(),job:null};slot.worker.onmessage=({data})=>this.complete(slot,data);slot.worker.onerror=()=>{slot.failed=true;slot.worker.terminate();if(slot.job)this.complete(slot,{id:slot.job.id,error:'Route worker unavailable.'});if(this.workers.every(s=>s.failed)){for(const job of this.jobs.values()){job.scope.routePlanning=false;delete job.scope.pendingRoute;}this.jobs.clear();this.queue=[];}};slot.worker.postMessage({kind:'init',land});return slot;});}
 bind(sim){this.sim=sim;this.queue=[];for(const [key,job] of this.jobs)if(job.sim!==sim)this.jobs.delete(key);for(const f of sim.fleets){f.routePlanning=false;if(f.pendingRoute){const u=sim.units.find(u=>u.fleetId===f.id&&!u.dead);if(u)this.request(sim,u,f.pendingRoute.destination,{fleet:true,pursuit:f.pendingRoute.pursuit});}}for(const u of sim.units)if(!u.fleetId){u.routePlanning=false;if(u.pendingRoute)this.request(sim,u,u.pendingRoute.destination,{fleet:false});}}
 request(sim,u,destination,{fleet=false,pursuit=false}={}){if(sim!==this.sim||!this.workers.some(s=>!s.failed)||sim.navigation?.land(destination.x,destination.y)||!sim.seaPointAllowed(u.team,destination.x,destination.y))return false;const scope=fleet?sim.fleets.find(f=>f.id===u.fleetId):u;if(!scope)return false;const key=(fleet?'fleet:':'ship:')+scope.id,old=this.jobs.get(key);if(old&&JSON.stringify(old.destination)===JSON.stringify(destination))return true;
  if(fleet&&!pursuit){const actor=sim.units.find(v=>v.id===scope.pursuitUnitId);if(actor){actor.target=null;actor.engageTargetId=null;}scope.pursuitUnitId=null;scope.pursuitStopped=false;}else if(!fleet){u.target=null;u.engageTargetId=null;u.pursuing=false;}
  const members=fleet?sim.units.filter(v=>v.fleetId===scope.id&&!v.dead):[u],job={id:++this.next,key,sim,scope,unitId:u.id,destination:{...destination},fleet,pursuit};scope.routePlanning=true;scope.pendingRoute={destination:{...destination},pursuit};
  job.data={kind:'plan',id:job.id,unitId:u.id,destination:job.destination,fleet,pursuit,sim:{mode:sim.mode,phase:sim.phase,playerTeam:sim.playerTeam,time:sim.time,factions:sim.factions,units:members.map(v=>({...v,trail:[],launchQueue:[]})),fleets:fleet?[{...scope}]:[]}};
  this.jobs.set(key,job);this.queue=this.queue.filter(j=>j.key!==key);this.queue.push(job);this.dispatch();return true;
 }
 cancel(sim,scope){const key=(sim.fleets.includes(scope)?'fleet:':'ship:')+scope.id;this.jobs.delete(key);this.queue=this.queue.filter(j=>j.key!==key);scope.routePlanning=false;delete scope.pendingRoute;}
 dispatch(){for(const slot of this.workers){if(slot.job||slot.failed)continue;let job;while(this.queue.length){const candidate=this.queue.shift();if(this.jobs.get(candidate.key)===candidate){job=candidate;break;}}if(job){slot.job=job;slot.worker.postMessage(job.data);}}}
 complete(slot,data){const job=slot.job;if(!job||data.id!==job.id)return;slot.job=null;
  if(this.jobs.get(job.key)===job){this.jobs.delete(job.key);const {sim,scope}=job;scope.routePlanning=false;delete scope.pendingRoute;
   const valid=sim===this.sim&&data.result&&!data.error&&data.result.units.every(v=>{const live=sim.units.find(u=>u.id===v.id&&!u.dead);if(!live)return true;let previous=live;return v.path.every(p=>{const ok=sim.seaSegmentAllowed(live.team,previous,p);previous=p;return ok;});});
   if(valid){if(data.result.fleet)Object.assign(scope,data.result.fleet);for(const v of data.result.units){const live=sim.units.find(u=>u.id===v.id&&!u.dead);if(live)Object.assign(live,v);}}
   else if(sim===this.sim){scope.aiMission=null;scope.aiRouteRetryAt=sim.time+30;if(scope.team===sim.playerTeam||sim.units.find(u=>u.id===job.unitId)?.team===sim.playerTeam)sim.event('Route unavailable. Choose another water destination.','route-error');}
  }this.dispatch();
 }
 dispose(){for(const slot of this.workers)slot.worker.terminate();this.jobs.clear();this.queue=[];}
}
