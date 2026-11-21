import fs from 'node:fs';
import {Simulation,INITIAL_STOCK} from '../public/engine.js';
import {Navigation} from '../public/navigation.js';
import {TERRITORIES} from '../public/territories.js';
import {deployReserves} from '../public/strategy.js';
const s=new Simulation();s.units=[];s.fleets=[];s.stock=s.factions.map(()=>({...INITIAL_STOCK}));s.navigation=new Navigation(JSON.parse(fs.readFileSync(new URL('../public/assets/land.json',import.meta.url))));s.preparingDeploymentPlan=true;const sites={};for(let team=0;team<s.factions.length;team++){s.time=10;deployReserves(s,team,TERRITORIES);if(Object.values(s.stock[team]).some(n=>n>0))throw Error('Incomplete deployment for '+team);sites[TERRITORIES[team].id]=s.deploymentSites.get(team);console.log(TERRITORIES[team].id,sites[TERRITORIES[team].id].land.length,sites[TERRITORIES[team].id].sea.length);}fs.writeFileSync(new URL('../public/deployment-sites.js',import.meta.url),'// Generated safe candidate pools, not fixed placements. Regenerate with node scripts/plan-deployments.mjs.\nexport const DEPLOYMENT_SITES='+JSON.stringify(sites)+';\n');
