import {TERRITORY_CITIES} from './territory-cities.js';
import {TERRITORY_MASKS} from './territory-data.js';
export const TERRITORIES=[
 {id:'northamerica',name:'North America',faction:'North American Command',color:'#80cedd',center:{x:-102,y:43},naval:[[-57,28],[-49,42]],ground:[[-108,39],[-94,43],[-81,36],[-97,33],[-76,43],[-101,49],[-72,47]],cities:[['New York',-74,41,8.8],['Washington',-77,39,6.3],['Chicago',-88,42,9.5],['Los Angeles',-118,34,12.5],['Seattle',-122,48,4.1],['Houston',-95,30,7.1],['Toronto',-79,44,6.2],['Mexico City',-99,19,21.8]]},
 {id:'southamerica',name:'South America',faction:'South American Command',color:'#ed899a',center:{x:-61,y:-17},naval:[[-30,-15],[-43,-34.5]],ground:[[-52,-14],[-64,-33],[-48,-20],[-58,-24],[-71,-30],[-63,-9],[-68,-17]],cities:[['São Paulo',-46.6,-23.5,22],['Buenos Aires',-58.4,-34.6,15],['Rio de Janeiro',-43.2,-22.9,13],['Lima',-77,-12,10],['Bogotá',-74.1,4.7,11],['Santiago',-70.7,-33.4,7],['Caracas',-66.9,10.5,5],['Brasília',-47.9,-15.8,4]]},
 {id:'europe',name:'Europe',faction:'European Command',color:'#a6d0a5',center:{x:12,y:51},naval:[[-16,43],[-9.5,60.5]],ground:[[10,49],[20,51],[4,47],[2,43],[13,53.5],[-2,54],[25,59]],cities:[['London',0,51,9],['Paris',2,49,11.1],['Berlin',13,52,6.1],['Rome',12,42,4.3],['Madrid',-3.7,40.4,6.7],['Warsaw',21,52,3.2],['Stockholm',18,59,2.4],['Istanbul',29,41,15.5]]},
 {id:'russia',name:'Russia',faction:'Russian Command',color:'#e6b775',center:{x:88,y:57},naval:[[170.5,52.5],[158,46]],ground:[[43,56],[70,55.5],[96,60],[35,58],[83,56],[58,63],[120,61]],cities:[['Moscow',38,56,12.7],['Saint Petersburg',30.3,59.9,5.4],['Novosibirsk',82.9,55,1.6],['Yekaterinburg',60.6,56.8,1.5],['Vladivostok',131.9,43.1,.6],['Omsk',73.4,55,1.2],['Krasnoyarsk',92.9,56,1.1],['Irkutsk',104.3,52.3,.6]]},
 {id:'africa',name:'Africa',faction:'African Command',color:'#ce9bc8',center:{x:20,y:2},naval:[[-14,-0.5],[47.5,-8.5]],ground:[[25,0],[20,-17],[29,-25],[12,8],[32,10],[15,-5],[35,-5]],cities:[['Cairo',31.2,30,21],['Lagos',3.4,6.5,15],['Kinshasa',15.3,-4.3,15],['Johannesburg',28,-26.2,9],['Nairobi',36.8,-1.3,5],['Casablanca',-7.6,33.6,4],['Luanda',13.2,-8.8,8],['Addis Ababa',38.8,9,5]]},
 {id:'southasia',name:'South Asia',faction:'South Asian Command',color:'#a5a9e6',center:{x:104,y:25},naval:[[133,21],[80,2]],ground:[[108,31],[78,22],[116,36],[103,35],[106,17],[91,28],[120,42]],cities:[['Beijing',116,40,21.5],['Shanghai',121,31,24.9],['Tokyo',140,36,37.4],['Mumbai',73,19,20.7],['Delhi',77.2,28.6,30],['Seoul',127,37.6,10],['Jakarta',106.8,-6.2,10.5],['Bangkok',100.5,13.8,10.5]]}
];
TERRITORIES.forEach((territory,i)=>territory.cities=TERRITORY_CITIES[i]);
export const ALLIANCES=[{id:'independent',name:'Independent'},{id:'alpha',name:'Alliance Alpha'},{id:'bravo',name:'Alliance Bravo'},{id:'charlie',name:'Alliance Charlie'}];
export function defaultFactions(){return TERRITORIES.map((t,id)=>({id,territory:t.id,name:t.faction,color:t.color,alliance:'independent',active:true}));}
export function validateSetup(config={}){
 const player=Number(config.playerTeam??0),factions=config.factions||defaultFactions();
 if(!Number.isInteger(player)||player<0||player>=6||factions.length!==6)throw Error('Choose a valid player territory.');
 const clean=factions.map((f,i)=>{if(f.territory!==TERRITORIES[i].id)throw Error('Territory ownership must be unique.');if(!ALLIANCES.some(a=>a.id===f.alliance))throw Error('Choose a valid alliance.');if(!/^#[a-f0-9]{6}$/i.test(f.color))throw Error('Choose a valid faction color.');const name=String(f.name||'').trim().slice(0,32);if(!name)throw Error('Enter a faction name.');return {id:i,territory:TERRITORIES[i].id,name,color:f.color,alliance:f.alliance,active:!!f.active};});
 if(!clean[player].active)throw Error('Your selected territory must be active.');
 if(clean.filter(f=>f.active).length<2)throw Error('Activate at least two factions.');
 const own=clean[player];if(!clean.some(f=>f.active&&f.id!==player&&(own.alliance==='independent'||f.alliance!==own.alliance)))throw Error('Keep at least one opposing alliance or independent faction.');
 return {playerTeam:player,factions:clean,radarSharing:config.radarSharing!==false};
}
export class TerritoryMap {
 constructor(){this.regions=TERRITORY_MASKS;}
 value(id,x,y){const region=this.regions.find(r=>r.id===id);if(!region||y>100||y< -100)return 0;const column=Math.floor((((x+180)%360+360)%360)/360*region.width),row=Math.floor((100-y)/360*region.width);return region.rows[row]?.find(([a,b])=>column>=a&&column<b)?.[2]||0;}
 contains(id,x,y,naval=false){return this.value(id,x,y)>=(naval?1:2);}
 at(x,y){const id=this.regions.find(r=>this.contains(r.id,x,y))?.id;return TERRITORIES.findIndex(t=>t.id===id);}
}
export const territoryMap=new TerritoryMap();
