import {FLEET_AVOIDANCE} from './balance.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const delta=(a,b)=>((b-a+540)%360)-180;
const norm=v=>Math.hypot(v.x,v.y);
const limit=(v,speed)=>{const length=norm(v);return length>speed?{x:v.x*speed/length,y:v.y*speed/length}:v;};
// One shared translation per formation preserves its six ships and their orders.
export function fleetAvoidance(groups,dt,allied,clear){
 const result=new Map();if(dt<=0)return result;
 const forces=groups.map(()=>({x:0,y:0})),pairs=[];
 for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++){
  const a=groups[i],b=groups[j];if(!allied(a.fleet.team,b.fleet.team))continue;
  const rx=delta(a.x,b.x),ry=b.y-a.y,d=Math.hypot(rx,ry),minimum=a.radius+b.radius+FLEET_AVOIDANCE.gap;
  if(d>minimum+FLEET_AVOIDANCE.lookahead*(a.speed+b.speed)+1)continue;
  const vx=a.velocity.x-b.velocity.x,vy=a.velocity.y-b.velocity.y,v2=vx*vx+vy*vy,t=v2>1e-12?clamp((rx*vx+ry*vy)/v2,0,FLEET_AVOIDANCE.lookahead):0,closest=Math.hypot(rx-vx*t,ry-vy*t);
  pairs.push({i,j,rx,ry,d,minimum});
  if(closest>=minimum+.6&&d>=minimum+.6){if(a.fleet.avoidanceSides)delete a.fleet.avoidanceSides[b.fleet.id];continue;}
  const movingA=norm(a.velocity)>.00001,movingB=norm(b.velocity)>.00001;
  if(!movingA&&!movingB&&d>=minimum)continue;
  let nx=v2>1e-12?vy/Math.sqrt(v2):d>1e-8?-rx/d:1,ny=v2>1e-12?-vx/Math.sqrt(v2):d>1e-8?-ry/d:0;
  const weightA=movingA?(movingB?.5:1):0,weightB=movingB?(movingA?.5:1):0;
  // Choose a passing side with room at the forecast crossing, not just this frame.
  const probe=sign=>(!movingA||clear(a,(a.velocity.x*t+nx*minimum*sign*weightA),(a.velocity.y*t+ny*minimum*sign*weightA)))&&(!movingB||clear(b,(b.velocity.x*t-nx*minimum*sign*weightB),(b.velocity.y*t-ny*minimum*sign*weightB)));
  a.fleet.avoidanceSides??={};const side=a.fleet.avoidanceSides[b.fleet.id]??(!probe(1)&&probe(-1)?-1:1);a.fleet.avoidanceSides[b.fleet.id]=side;nx*=side;ny*=side;
  const urgency=clamp((minimum+.6-closest)/.6,0,1),strength=1.8*urgency;
  forces[i].x+=nx*a.speed*strength*weightA;forces[i].y+=ny*a.speed*strength*weightA;
  forces[j].x-=nx*b.speed*strength*weightB;forces[j].y-=ny*b.speed*strength*weightB;
  if(d<minimum){const px=d>1e-8?-rx/d:1,py=d>1e-8?-ry/d:0,push=clamp((minimum-d)/minimum,0,1)*2;forces[i].x+=px*a.speed*push;forces[i].y+=py*a.speed*push;forces[j].x-=px*b.speed*push;forces[j].y-=py*b.speed*push;}
 }
 const velocities=groups.map((g,i)=>{const old=g.fleet.avoidance||{x:0,y:0},blend=1-Math.exp(-dt/FLEET_AVOIDANCE.response),force={x:old.x+(forces[i].x-old.x)*blend,y:old.y+(forces[i].y-old.y)*blend};if(norm(force)<1e-6)force.x=force.y=0;g.fleet.avoidance=force;return limit({x:g.velocity.x+force.x,y:g.velocity.y+force.y},g.speed);});
 // Remove closing velocity only at the safety boundary; tangential motion remains.
 for(const p of pairs){const a=velocities[p.i],b=velocities[p.j],next=Math.hypot(p.rx+(b.x-a.x)*dt,p.ry+(b.y-a.y)*dt);if(p.d<p.minimum-1e-7||next>=p.minimum)continue;const nx=-p.rx/p.d,ny=-p.ry/p.d,intoA=Math.min(0,a.x*nx+a.y*ny),intoB=Math.max(0,b.x*nx+b.y*ny);a.x-=nx*intoA;a.y-=ny*intoA;b.x-=nx*intoB;b.y-=ny*intoB;}
 for(let i=0;i<groups.length;i++){const g=groups[i],v=velocities[i],changed=norm(g.fleet.avoidance)>0||Math.abs(v.x-g.velocity.x)>1e-10||Math.abs(v.y-g.velocity.y)>1e-10;if(changed&&!clear(g,v.x*dt,v.y*dt))velocities[i]={x:0,y:0};}
 // A coastal stop must not allow a following fleet to cross its safety boundary.
 let changed=true;while(changed){changed=false;for(const p of pairs){if(p.d<p.minimum-1e-7)continue;const a=velocities[p.i],b=velocities[p.j];if(Math.hypot(p.rx+(b.x-a.x)*dt,p.ry+(b.y-a.y)*dt)<p.minimum-1e-8&&(norm(a)>0||norm(b)>0)){velocities[p.i]={x:0,y:0};velocities[p.j]={x:0,y:0};changed=true;}}}
 for(let i=0;i<groups.length;i++){const g=groups[i],v=velocities[i];if(norm(g.fleet.avoidance)>0||Math.abs(v.x-g.velocity.x)>1e-10||Math.abs(v.y-g.velocity.y)>1e-10)result.set(g.fleet.id,{x:v.x*dt,y:v.y*dt});}
 return result;
}
