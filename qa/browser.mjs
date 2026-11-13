import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
 await page.goto('http://localhost:5186');await page.waitForFunction(()=>window.blackout?.mapLoaded);
 assert.equal(await page.evaluate(()=>window.blackout.baseline),'v1.43');
 assert.equal(await page.locator('[data-type="fighter"]').count(),0);
 assert.equal(await page.locator('[data-speed="20"]').innerText(),'20×');
 await page.screenshot({path:'qa/desktop.png',fullPage:true});
 const map=await page.locator('#map').boundingBox();
 await page.locator('[data-type="battleship"]').click();await page.locator('[data-type="carrier"]').click();
 assert.match(await page.locator('#fleet-builder').innerText(),/2 \/ 6/);
 await page.mouse.click(map.x+map.width/2-70,map.y+map.height/2-30);assert.match(await page.locator('#toast').innerText(),/Units placed/);
 await page.locator('#begin').click();await page.locator('#pause').click();const frozen=await page.evaluate(()=>window.blackout.time);await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>window.blackout.time),frozen);
 const carrier=await page.evaluate(()=>window.blackout.units.find(u=>u.type==='carrier'&&u.team===0));
 await page.locator(`[data-contact="${carrier.id}"]`).click();assert.match(await page.locator('#inspector').innerText(),/Fighters/);assert.match(await page.locator('#inspector').innerText(),/5 \/ 5/);assert.match(await page.locator('#inspector').innerText(),/2 \/ 2/);assert.match(await page.locator('#inspector').innerText(),/0.03°\/s/);
 await page.mouse.click(map.x+map.width/2+55,map.y+map.height/2,{button:'right'});assert.ok(await page.evaluate(id=>window.blackout.units.find(u=>u.id===id).order,carrier.id));
 for(let i=0;i<4;i++)await page.locator('#escalate').click();assert.equal(await page.evaluate(()=>window.blackout.phase),1);
 const base=await page.evaluate(()=>window.blackout.units.find(u=>u.type==='airbase'&&u.team===0));await page.locator(`[data-contact="${base.id}"]`).click();await page.mouse.click(map.x+map.width/2+50,map.y+map.height/2);assert.ok(await page.evaluate(()=>window.blackout.units.some(u=>u.type==='fighter'&&u.team===0)));assert.match(await page.locator('#inspector').innerText(),/4 \/ 10/);
 const silo=await page.evaluate(()=>window.blackout.units.find(u=>u.type==='silo'&&u.team===0));await page.locator(`[data-contact="${silo.id}"]`).click();await page.locator('#inspector [data-mode="launch"]').click();assert.match(await page.locator('#inspector').innerText(),/PREPARING/);assert.match(await page.locator('#inspector').innerText(),/120s/);
 await page.locator('[data-speed="20"]').click();await page.clock.install();await page.locator('#pause').click();await page.clock.runFor(6500);await page.locator('#pause').click();
 assert.equal(await page.evaluate(id=>Math.ceil(window.blackout.units.find(u=>u.id===id).stateTimer),silo.id),0);await page.mouse.click(map.x+map.width*.75,map.y+map.height*.4);assert.ok(await page.evaluate(()=>window.blackout.missiles.some(m=>m.team===0)));
 await page.locator('#sound').click();await page.waitForTimeout(2000);assert.ok(await page.evaluate(()=>window.blackout.audio.musicPlaying));assert.match(await page.evaluate(()=>window.blackout.audio.music),/classic\/audio\/defconmus1a.ogg/);assert.deepEqual(await page.evaluate(()=>window.blackout.audio.errors),[]);
 await page.screenshot({path:'qa/nuclear.png',fullPage:true});
 await page.locator('#help').click();assert.equal(await page.locator('#manual-dialog').isVisible(),true);await page.locator('#manual-ready').click();
 await page.locator('#lab-tab').click();await page.locator('[data-preset="nuclear"]').click();await page.locator('#launch-lab').click();await page.clock.runFor(7000);assert.ok(await page.evaluate(()=>window.blackout.missiles.length>0));
 await page.screenshot({path:'qa/battle.png',fullPage:true});await page.locator('#pause').click();
 for(const width of [1024,768,390]){await page.setViewportSize({width,height:900});await page.clock.runFor(300);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.ok(await page.locator('#inspector').isVisible());if(width===390)await page.screenshot({path:'qa/mobile.png',fullPage:true});}
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);console.log(JSON.stringify({passed:true,checks:['original textures','finite stock','six-ship fleet composition','right-click movement','pause','native speeds in inspector','carrier garrison','airbase aircraft launch','silo state preparation','nuclear launch','original OGG music playback','no audio decode errors','field manual','nuclear lab','desktop/tablet/mobile overflow','no runtime or HTTP errors']},null,2));
} finally {await browser.close();}
