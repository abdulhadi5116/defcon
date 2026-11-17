import {Simulation} from './engine.js';
import {territoryMap,legacyTerritoryMap} from './territories.js';
export function planNavalRoute(data,navigation){
 const sim=Object.assign(Object.create(Simulation.prototype),{...data.sim,navigation,territoryMap:data.sim.factions.length===6?legacyTerritoryMap:territoryMap,routePlanner:null});
 const unit=sim.units.find(u=>u.id===data.unitId),ok=unit&&(data.fleet?sim.commandFleet(unit,data.destination,{pursuit:data.pursuit}):sim.moveUnit(unit,data.destination));
 if(!ok)return null;const fleet=data.fleet?sim.fleets.find(f=>f.id===unit.fleetId):null;
 return {fleet:fleet&&Object.fromEntries(['id','order','formationAngle','formationRadius','navigationClearance','coastRecovering','coastBlocked'].map(k=>[k,fleet[k]])),units:sim.units.map(u=>({id:u.id,path:u.path,order:u.order,navigationClearance:u.navigationClearance}))};
}
