import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:950}});await page.goto('http://localhost:5186');
 const result=await page.evaluate(async()=>{
  const {Renderer}=await import('/renderer.js'),{Simulation}=await import('/engine.js'),canvas=document.createElement('canvas');canvas.style='position:fixed;inset:0;width:100vw;height:100vh';document.body.append(canvas);const r=new Renderer(canvas);await r.ready;r.resize();
  const s=new Simulation();s.cities=[.1,1,3,6,12,30].map((pop,i)=>({name:'City '+i,pop,initial:pop,x:i*3-8,y:0,team:0}));r.layers.population=true;
  const rotate=r.ctx.rotate.bind(r.ctx),text=r.text.bind(r),counts=[];let dots=0,labels=0;
  r.ctx.rotate=angle=>{if(angle===Math.PI/4)dots++;rotate(angle);};r.text=(v,...rest)=>{if(v.startsWith('CITY '))labels++;text(v,...rest);};
  for(const zoom of [1,3,6]){dots=labels=0;r.focus(0,0,zoom);r.drawCities(s);const p=r.project(s.cities[0].x,s.cities[0].y);counts.push({zoom,dots,labels,smallCityPick:r.pickCity(s,p.x,p.y)?.name});}
  r.resizeObserver.disconnect();return counts;
 });
 for(const entry of result){assert.equal(entry.dots,6);assert.equal(entry.smallCityPick,'City 0');}assert.ok(result[2].labels>result[0].labels);console.log(JSON.stringify({passed:true,result}));
}finally{await browser.close();}
