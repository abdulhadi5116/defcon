export const TYPES = {
 battleship:{name:'Battleship',hp:160,speed:1.35,range:16,damage:23,cooldown:3.8,cost:3,domain:'sea',targets:['sea','air'],icon:'ship'},
 carrier:{name:'Carrier',hp:200,speed:.9,range:12,damage:12,cooldown:4,cost:4,domain:'sea',targets:['air','sea'],icon:'carrier'},
 submarine:{name:'Submarine',hp:85,speed:1.1,range:15,damage:30,cooldown:6,cost:3,domain:'sea',targets:['sea'],icon:'sub'},
 fighter:{name:'Fighter',hp:55,speed:5.4,range:11,damage:20,cooldown:2.2,cost:2,domain:'air',targets:['air'],icon:'fighter'},
 bomber:{name:'Bomber',hp:85,speed:2.9,range:10,damage:38,cooldown:6,cost:3,domain:'air',targets:['sea','ground'],icon:'bomber'},
 silo:{name:'Nuclear silo',hp:180,speed:0,range:24,damage:24,cooldown:3,cost:4,domain:'ground',targets:['air'],icon:'silo'},
 radar:{name:'Radar station',hp:100,speed:0,range:0,damage:0,cooldown:0,cost:2,domain:'ground',targets:[],icon:'radar'}
};
export const CITIES=[
 ['New York',-74,41,8.8,0],['Washington',-77,39,6.3,0],['Chicago',-88,42,9.5,0],['Los Angeles',-118,34,12.5,0],['Seattle',-122,48,4.1,0],['Houston',-95,30,7.1,0],['Toronto',-79,44,6.2,0],['Mexico City',-99,19,21.8,0],
 ['London',0,51,9,1],['Paris',2,49,11.1,1],['Berlin',13,52,6.1,1],['Moscow',38,56,12.7,1],['Rome',12,42,4.3,1],['Beijing',116,40,21.5,1],['Shanghai',121,31,24.9,1],['Tokyo',140,36,37.4,1],['Mumbai',73,19,20.7,1],['Tehran',51,36,9.3,1]
];
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export class Simulation {
 constructor({mode='war',seed=42,difficulty='standard',left='battleship',right='bomber',count=5}={}) {
  this.mode=mode;this.seed=seed;this.difficulty=difficulty;this.time=0;this.phase=mode==='lab'?1:5;this.units=[];this.missiles=[];this.shots=[];this.blasts=[];this.events=[];this.nextId=1;this.losses=[0,0];this.kills=[0,0];this.remaining=[36,36];this.budget=16;this.running=false;this.ended=false;this.winner=null;this.aiClock=0;this.onEvent=()=>{};this.onEffect=()=>{};this.alert=0;this.totalNukes=0;this.radioClock=0;this.radioIndex=0;
  this.cities=CITIES.map(([name,x,y,pop,team])=>({name,x,y,pop,initial:pop,team,dead:false}));
  if(mode==='lab'){this.setupLab(left,right,count);}else this.setupWar();
  this.remaining=[0,1].map(team=>this.units.filter(u=>u.team===team).reduce((sum,u)=>sum+u.ammo,0));
 }
 random(){this.seed=(Math.imul(1664525,this.seed)+1013904223)>>>0;return this.seed/4294967296;}
 event(message,kind='info'){const e={time:this.time,message,kind,id:this.nextId++};this.events.unshift(e);this.events.length=Math.min(this.events.length,80);this.onEvent(e);}
 add(type,team,x,y){const t=TYPES[type];if(!t)return null;const u={id:this.nextId++,type,team,x,y,hp:t.hp,maxHp:t.hp,target:null,order:null,cooldown:this.random()*3,ammo:['bomber','submarine'].includes(type)?2:type==='silo'?6:0,heading:team===0?0:Math.PI,dead:false,kills:0,trail:[]};this.units.push(u);return u;}
 setupWar(){
  for(const team of [0,1]){
   const x=team===0?-64:-15;
   for(let i=0;i<4;i++){this.add('battleship',team,x+(i%2)*5,24+Math.floor(i/2)*9);this.add('fighter',team,x-6,28+i*5);}
   for(let i=0;i<2;i++){this.add('carrier',team,x-4,20+i*22);this.add('submarine',team,x+10,18+i*29);this.add('bomber',team,team===0?-82:4,32+i*12);}
   for(let i=0;i<3;i++)this.add('silo',team,team===0?-112+i*15:10+i*17,team===0?39+i*3:49+i*2);
   this.add('radar',team,team===0?-100:23,54);
  }
  this.event('Command uplink established. Atlantic theater online.');this.event('DEFCON 5 · Deploy forces. Weapons hold.','alert');
 }
 setupLab(left,right,count){
  this.cities=[];this.labTypes=[left,right];
  for(let i=0;i<count;i++)for(let team=0;team<2;team++){
   const type=team===0?left:right;
   const u=this.add(type==='nuclear'?'silo':type,team,team===0?-51:-12,22+i*6);
   if(!u)continue;
   if(type!=='nuclear'&&TYPES[u.type].speed>0)u.order={x:team===0?-10:-53,y:22+i*6};
  }
  this.event('Battle laboratory initialized. Weapons free.','alert');
 }
 deploy(type,x,y){if(this.ended)return {ok:false,reason:'Operation has ended.'};if(this.mode!=='war')return {ok:false,reason:'Use the battle lab configuration to change forces.'};if(this.phase<4)return {ok:false,reason:'Deployment closed at DEFCON 3.'};const t=TYPES[type];if(!t)return {ok:false,reason:'Unknown asset.'};if(x> -35||x< -160||y<5||y>70)return {ok:false,reason:'Deploy inside the western command sector (160°W to 35°W, 5°N to 70°N).'};if(this.budget<t.cost)return {ok:false,reason:'Insufficient deployment credits.'};this.budget-=t.cost;const u=this.add(type,0,x,y);this.event(`${t.name} deployed to western command.`);return {ok:true,unit:u};}
 order(id,x,y,targetId=null){const u=this.units.find(v=>v.id===id&&!v.dead);if(!u||u.team!==0||this.ended)return false;if(!TYPES[u.type].speed)return false;u.order={x:Math.max(-174,Math.min(174,x)),y:Math.max(-65,Math.min(80,y))};u.target=targetId;this.event(`${TYPES[u.type].name} ${u.id}: ${targetId?'engage contact':'new heading confirmed'}.`);return true;}
 escalate(){if(this.phase<=1||this.ended)return;this.phase--;this.alert=5;this.event(`DEFCON ${this.phase} · ${['','Nuclear release authorized.','Strategic forces on alert.','Conventional weapons free.','Prepare for hostilities.'][this.phase]}`,'alert');this.onEffect('alarm');}
 launch(id,x,y){const u=this.units.find(v=>v.id===id&&!v.dead);if(this.ended)return {ok:false,reason:'Operation has ended.'};if(this.phase!==1)return {ok:false,reason:'Nuclear weapons locked until DEFCON 1.'};if(!u||!['silo','bomber','submarine'].includes(u.type))return {ok:false,reason:'Select a silo, bomber or submarine.'};if(u.ammo<=0||this.remaining[u.team]<=0)return {ok:false,reason:'Nuclear inventory depleted.'};if(u.cooldown>0)return {ok:false,reason:'Launch system recharging.'};if(u.type!=='silo'&&Math.hypot(x-u.x,y-u.y)>65)return {ok:false,reason:'Target outside launch radius (65°). Move closer.'};u.ammo--;u.cooldown=12;this.remaining[u.team]--;this.totalNukes++;this.missiles.push({id:this.nextId++,team:u.team,sx:u.x,sy:u.y,x:u.x,y:u.y,tx:x,ty:y,p:0,duration:13+Math.hypot(x-u.x,y-u.y)*.13,dead:false});this.event(`${u.team===0?'FRIENDLY':'HOSTILE'} LAUNCH DETECTED · ${TYPES[u.type].name} ${u.id}.`,'nuclear');this.onEffect('launch');return {ok:true};}
 hit(u,damage,attacker){if(u.dead)return;u.hp=Math.max(0,u.hp-damage);if(u.hp===0){u.dead=true;this.kills[1-u.team]++;if(attacker)attacker.kills++;this.blasts.push({x:u.x,y:u.y,age:0,nuclear:false});this.event(`${u.team===0?'Friendly':'Hostile'} ${TYPES[u.type].name.toLowerCase()} ${u.id} destroyed.`,u.team===0?'danger':'success');this.onEffect('hit');}}
 detonate(m){m.dead=true;this.blasts.push({x:m.tx,y:m.ty,age:0,nuclear:true});for(const u of this.units)if(!u.dead&&dist(u,{x:m.tx,y:m.ty})<11)this.hit(u,300*(1-dist(u,{x:m.tx,y:m.ty})/13));let casualties=0;for(const c of this.cities){const d=dist(c,{x:m.tx,y:m.ty});if(d<16){const lost=c.pop*Math.max(.05,1-d/18)*.85;c.pop-=lost;this.losses[c.team]+=lost;casualties+=lost;if(c.pop<.5)c.dead=true;}}this.event(`DETONATION · ${casualties.toFixed(1)}M estimated casualties.`,'nuclear');this.onEffect('nuclear');this.alert=2;}
 tick(dt){
  if(!this.running||this.ended)return;dt=Math.max(0,Math.min(dt,1));this.time+=dt;this.alert=Math.max(0,this.alert-dt);
  if(this.mode==='war'&&this.phase>1&&this.time>=(6-this.phase)*55)this.escalate();
  for(const b of this.blasts)b.age+=dt;this.blasts=this.blasts.filter(b=>b.age<(b.nuclear?28:4));
  for(const s of this.shots)s.age+=dt;this.shots=this.shots.filter(s=>s.age<.4);
  for(const u of this.units){
   if(u.dead)continue;const t=TYPES[u.type];u.cooldown=Math.max(0,u.cooldown-dt);
   let enemy=this.units.find(e=>e.id===u.target&&!e.dead&&e.team!==u.team);
   if(!enemy||dist(u,enemy)>t.range*2){enemy=null;let nearest=t.range;for(const e of this.units){if(e.dead||e.team===u.team||!t.targets.includes(TYPES[e.type].domain))continue;const d=dist(u,e);if(d<nearest){nearest=d;enemy=e;}}}
   if(this.phase<=3&&enemy&&t.targets.includes(TYPES[enemy.type].domain)&&dist(u,enemy)<=t.range&&u.cooldown<=0){
    u.cooldown=t.cooldown;this.shots.push({x:u.x,y:u.y,tx:enemy.x,ty:enemy.y,team:u.team,age:0});this.hit(enemy,t.damage*(.8+this.random()*.4),u);this.onEffect('shot');
   }
   if(u.type==='silo'&&this.phase<=3&&u.cooldown<=0){const missile=this.missiles.find(m=>!m.dead&&m.team!==u.team&&m.p>.6&&dist(u,m)<28);if(missile){u.cooldown=4;this.shots.push({x:u.x,y:u.y,tx:missile.x,ty:missile.y,team:u.team,age:0});if(this.random()<.3){missile.dead=true;this.event('Incoming warhead intercepted.','success');this.blasts.push({x:missile.x,y:missile.y,age:0,nuclear:false});}}}
   if(t.speed>0){let dest=u.order;if(u.team===1&&this.mode==='war'&&this.phase<=3){if(!dest||dist(u,dest)<4){const targets=this.units.filter(e=>!e.dead&&e.team===0&&(t.targets.includes(TYPES[e.type].domain)||TYPES[e.type].domain===t.domain));dest=targets.sort((a,b)=>dist(u,a)-dist(u,b))[0];u.order=dest?{x:dest.x,y:dest.y}:null;}}
    if(enemy&&dist(u,enemy)<t.range*.75&&t.targets.includes(TYPES[enemy.type].domain))dest=null;
    if(dest){const d=dist(u,dest);if(d>.3){u.heading=Math.atan2(dest.y-u.y,dest.x-u.x);const step=Math.min(d,t.speed*dt);u.x+=Math.cos(u.heading)*step;u.y+=Math.sin(u.heading)*step;if(this.random()<dt*4){u.trail.push({x:u.x,y:u.y});if(u.trail.length>18)u.trail.shift();}}else u.order=null;}
   }
  }
  for(const m of this.missiles){if(m.dead)continue;m.p+=dt/m.duration;m.x=m.sx+(m.tx-m.sx)*m.p;m.y=m.sy+(m.ty-m.sy)*m.p+Math.sin(m.p*Math.PI)*28;if(m.p>=1)this.detonate(m);}
  this.missiles=this.missiles.filter(m=>!m.dead);
  this.radioClock+=dt;
  if(this.mode==='war'&&this.phase<=3&&this.radioClock>38){this.radioClock=0;const transmissions=['Emergency broadcast: remain indoors. Do not approach the windows.','Civil defense: underground shelters are reaching capacity.','Open frequency: is anybody receiving this transmission?','Medical channel: emergency power is failing. Request immediate assistance.','Civilian relay: the sky is brighter than it should be.','Command: several regional stations have stopped responding.'];this.event(transmissions[this.radioIndex++%transmissions.length],'radio');this.onEffect('radio');}
  this.aiClock+=dt;
  if(this.phase===1&&this.aiClock> (this.difficulty==='hard'?3.5:this.difficulty==='easy'?12:7)){
   this.aiClock=0;const teams=this.mode==='lab'?[0,1]:[1];for(const team of teams){if(this.mode==='lab'&&this.labTypes[team]!=='nuclear')continue;const shooters=this.units.filter(u=>!u.dead&&u.team===team&&['silo','bomber','submarine'].includes(u.type)&&u.ammo>0&&u.cooldown<=0);if(shooters.length){const source=shooters[Math.floor(this.random()*shooters.length)];const choices=this.cities.filter(c=>c.team!==team&&c.pop>1);const opponents=this.units.filter(u=>!u.dead&&u.team!==team);const target=choices.length?choices[Math.floor(this.random()*choices.length)]:opponents[Math.floor(this.random()*opponents.length)];if(target)this.launch(source.id,target.x,target.y);}}
  }
  if(this.mode==='lab'){
   const alive=[0,1].map(team=>this.units.some(u=>!u.dead&&u.team===team));
   if(!alive[0]||!alive[1])this.finish(alive[0]?0:alive[1]?1:null);
   else if(this.time>240)this.finish(this.kills[0]>this.kills[1]?0:this.kills[1]>this.kills[0]?1:null);
  }else if(this.time>=600||this.losses.some((l,i)=>l>this.cities.filter(c=>c.team===i).reduce((s,c)=>s+c.initial,0)*.85)||this.units.filter(u=>u.team===0).every(u=>u.dead)||this.units.filter(u=>u.team===1).every(u=>u.dead)){
   const scores=this.scores();this.finish(scores[0]>scores[1]?0:scores[1]>scores[0]?1:null);
  }
 }
 scores(){return [0,1].map(t=>Math.round(this.kills[t]*4-this.losses[t]*2+this.losses[1-t]));}
 finish(winner){this.ended=true;this.running=false;this.winner=winner;this.event('Operation terminated. Final assessment available.','alert');this.onEffect('end');}
}
