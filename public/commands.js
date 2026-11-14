export function primaryAction(u){
 if(!u||u.dead||u.landed)return null;
 if(['silo','submarine','bomber'].includes(u.type)&&['launch','nuclear'].includes(u.mode))return {kind:'nuclear',label:'TARGET NUCLEAR STRIKE'};
 if(['airbase','carrier'].includes(u.type)&&['fighter','bomber'].includes(u.mode))return {kind:'aircraft',label:`LAUNCH ${u.mode.toUpperCase()}`};
 return null;
}
// Selection never implicitly arms a command against empty map coordinates.
export function mapCommand(sim,{selectedId,unit=null,city=null,point,targetingId=null}){
 const select=unit=>({kind:'select',unit}),own=sim.units.find(u=>u.id===selectedId&&!u.dead&&!u.landed);
 if(!sim.started||sim.ended)return select(unit);
 if(unit&&sim.allied(unit.team,sim.playerTeam))return select(unit);
 if(!own||own.team!==sim.playerTeam)return select(unit);
 const target=unit||city,action=primaryAction(own),destination=target||point;
 if(action&&(target||targetingId===own.id))return {kind:'action',result:sim.queueAction(own.id,action.kind,destination.x,destination.y,unit?.id)};
 if(unit&&sim.hostile(unit.team,sim.playerTeam))return {kind:'action',result:{ok:sim.order(own.id,unit.x,unit.y,unit.id),reason:'Target cannot be engaged in the current state.'}};
 return select(unit);
}
