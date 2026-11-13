// Input: Natural Earth ne_50m_populated_places_simple.geojson, public domain.
// https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_populated_places_simple.geojson
import fs from 'node:fs';
import {TERRITORY_MASKS} from '../dist/territory-data.js';
const source=process.argv[2];if(!source)throw Error('Pass the Natural Earth populated-places GeoJSON path.');
const at=(x,y)=>TERRITORY_MASKS.findIndex(region=>{const col=Math.floor((((x+180)%360+360)%360)/360*512),row=Math.floor((100-y)/360*512);return region.rows[row]?.some(([a,b,v])=>col>=a&&col<b&&v===2);});
const groups=Array.from({length:6},()=>[]);
for(const {geometry,properties:p} of JSON.parse(fs.readFileSync(source)).features){const [x,y]=geometry.coordinates;let team=at(x,y);if(team<0){let nearest=Infinity;for(let dy=-1.5;dy<=1.5;dy+=.5)for(let dx=-1.5;dx<=1.5;dx+=.5){const candidate=at(x+dx,y+dy),d=Math.hypot(dx,dy);if(candidate>=0&&d<nearest){team=candidate;nearest=d;}}}if(team>=0)groups[team].push([p.name,x,y,Math.max(.05,Number(p.pop_max||100000)/1e6)]);}
const cities=groups.map(g=>g.sort((a,b)=>b[3]-a[3]).slice(0,25));if(cities.some(g=>g.length!==25))throw Error('Each territory requires 25 cities.');
fs.writeFileSync(new URL('../dist/territory-cities.js',import.meta.url),'// Natural Earth 1:50m populated places; top 25 by source population per original game territory.\nexport const TERRITORY_CITIES='+JSON.stringify(cities)+';\n');console.log('25 cities per territory exported.');
