const wrap=x=>((x+180)%360+360)%360-180;
export const COAST_MARGIN=1;
export const PASSAGE_MARGIN=.05;
// Water routes use the retained coastline, with clearance for visible hulls and formations.
export class Navigation {
 constructor(geojson){this.polygons=geojson.features.flatMap(f=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates);this.regions=this.polygons.map(p=>({p,minX:Math.min(...p[0].map(v=>v[0])),maxX:Math.max(...p[0].map(v=>v[0])),minY:Math.min(...p[0].map(v=>v[1])),maxY:Math.max(...p[0].map(v=>v[1]))}));this.cache=new Map();this.edges=new Map();this.nodeMargins=new Map();this.step=2;this.cols=180;this.rows=80;}
 inRing(x,y,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
 land(x,y){x=wrap(x);return this.regions.some(({p,minX,maxX,minY,maxY})=>x>=minX&&x<=maxX&&y>=minY&&y<=maxY&&this.inRing(x,y,p[0])&&!p.slice(1).some(r=>this.inRing(x,y,r)));}
 coastDistance(x,y,limit=COAST_MARGIN){x=wrap(x);let best=Infinity;for(const {p,minX,maxX,minY,maxY} of this.regions){if(y<minY-limit||y>maxY+limit||(x<minX-limit||x>maxX+limit)&&(x-360<minX-limit||x-360>maxX+limit)&&(x+360<minX-limit||x+360>maxX+limit))continue;for(const ring of p)for(let i=1;i<ring.length;i++){const a=ring[i-1],b=ring[i],ax=wrap(a[0]-x),ay=a[1]-y,dx=wrap(b[0]-a[0]),dy=b[1]-a[1],t=Math.max(0,Math.min(1,-(ax*dx+ay*dy)/(dx*dx+dy*dy||1)));best=Math.min(best,Math.hypot(ax+dx*t,ay+dy*t));}}return best;}
 navigable(x,y,clearance=COAST_MARGIN){return !this.land(x,y)&&this.coastDistance(x,y,clearance)+1e-7>=clearance;}
 waterNode(x,y,clearance=COAST_MARGIN){const id=y*this.cols+x,key=`${id}/${clearance}`;if(!this.nodeMargins.has(id)){const px=-179+x*2,py=-79+y*2;this.nodeMargins.set(id,this.land(px,py)?-1:this.coastDistance(px,py,4));}if(!this.cache.has(key))this.cache.set(key,this.nodeMargins.get(id)+1e-7>=clearance);return this.cache.get(key);}

 clear(a,b,clearance=COAST_MARGIN,allowed=null){
  if(this.land(a.x,a.y))return false;const dx=wrap(b.x-a.x),dy=b.y-a.y,length=Math.hypot(dx,dy),required=Math.min(clearance,this.coastDistance(a.x,a.y,clearance)),lookahead=allowed?.1:4;let travelled=0;
  // Coast distance bounds the safe step; open sea does not need pixel-sized sampling.
  for(;;){const t=length?travelled/length:1,x=wrap(a.x+dx*t),y=a.y+dy*t,coast=this.coastDistance(x,y,required+lookahead);if(travelled>0&&(this.land(x,y)||coast+1e-7<required||allowed&&!allowed(x,y)))return false;if(travelled>=length)return !allowed||allowed(x,y);travelled=Math.min(length,travelled+Math.min(lookahead,Math.max(.01,(coast-required)*.75)));}
 }

 // Recover legacy/deflected hulls without teleporting or accepting a route through land.
 escape(from,goal,step,allowed=null,margin=COAST_MARGIN){const signed=p=>{const nearby=this.coastDistance(p.x,p.y,12),d=Number.isFinite(nearby)?nearby:this.coastDistance(p.x,p.y,180);return this.land(p.x,p.y)?-d:Math.min(margin,d);},current=signed(from),desired=Math.atan2(goal.y-from.y,wrap(goal.x-from.x));let best=null,score=-Infinity;for(let i=0;i<64;i++){const angle=desired+i*Math.PI/32,p={x:wrap(from.x+Math.cos(angle)*step),y:from.y+Math.sin(angle)*step};if(p.y<-79||p.y>80||allowed&&!allowed(p.x,p.y))continue;const clearance=signed(p);if(current<margin-1e-7?clearance<=current+1e-8:!this.clear(from,p,margin))continue;const value=current<margin-1e-7?clearance+Math.cos(angle-desired)*step*.01:Math.cos(angle-desired);if(value>score){best=p;score=value;}}return best;}
 node(p,clearance,allowed=null){const x=Math.max(0,Math.min(179,Math.round((wrap(p.x)+179)/2))),y=Math.max(0,Math.min(79,Math.round((p.y+79)/2)));let best=null,distance=Infinity;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const nx=(x+dx+180)%180,ny=y+dy;if(ny<0||ny>=80||!this.waterNode(nx,ny,clearance))continue;const point={x:-179+nx*2,y:-79+ny*2},d=Math.hypot(wrap(point.x-p.x),point.y-p.y);if(d<distance&&(!allowed||allowed(point.x,point.y))&&this.clear(p,point,clearance,allowed)){best={x:nx,y:ny};distance=d;}}return best;}
 coarseRoute(from,to,clearance=COAST_MARGIN,allowed=null){if(!this.navigable(to.x,to.y,clearance)||allowed&&!allowed(to.x,to.y))return null;if(this.clear(from,to,clearance,allowed))return [{...to}];const start=this.node(from,clearance,allowed),end=this.node(to,clearance,allowed);if(!start||!end)return null;const id=p=>p.y*this.cols+p.x,goal=id(end),cost=new Map([[id(start),0]]),prev=new Map(),open=[{...start,f:0}],closed=new Set();let found=false;
  while(open.length){let index=0;for(let i=1;i<open.length;i++)if(open[i].f<open[index].f)index=i;const p=open.splice(index,1)[0],key=id(p);if(closed.has(key))continue;if(key===goal){found=true;break;}closed.add(key);if(closed.size>14500)break;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const n={x:(p.x+dx+180)%180,y:p.y+dy};if(n.y<0||n.y>=80||!this.waterNode(n.x,n.y,clearance)||allowed&&!allowed(-179+n.x*2,-79+n.y*2))continue;const nk=id(n);if(closed.has(nk))continue;const edge=`${Math.min(key,nk)}:${Math.max(key,nk)}:${clearance}`;if(!this.edges.has(edge))this.edges.set(edge,Math.min(this.nodeMargins.get(key),this.nodeMargins.get(nk))>=clearance+Math.hypot(dx,dy)||this.clear({x:-179+p.x*2,y:-79+p.y*2},{x:-179+n.x*2,y:-79+n.y*2},clearance));if(!this.edges.get(edge)||allowed&&!this.clear({x:-179+p.x*2,y:-79+p.y*2},{x:-179+n.x*2,y:-79+n.y*2},clearance,allowed))continue;const next=cost.get(key)+Math.hypot(dx,dy);if(next>=(cost.get(nk)??Infinity))continue;cost.set(nk,next);prev.set(nk,key);open.push({...n,f:next+Math.hypot(Math.min(Math.abs(n.x-end.x),180-Math.abs(n.x-end.x)),n.y-end.y)});}
  }
  if(!found)return null;let key=goal,path=[];while(key!==id(start)){path.unshift({x:-179+(key%180)*2,y:-79+Math.floor(key/180)*2});key=prev.get(key);if(key===undefined)return null;}path.unshift({x:-179+start.x*2,y:-79+start.y*2});path.push({...to});const result=[];let anchor=from;while(path.length){let far=-1;for(let i=path.length-1;i>=0;i--)if(this.clear(anchor,path[i],clearance,allowed)){far=i;break;}if(far<0)return null;anchor=path[far];result.push(anchor);path=path.slice(far+1);}return result;
 }
 route(from,to,clearance=COAST_MARGIN,allowed=null){
  this.routes??=new Map();const key=allowed?null:[from.x,from.y,to.x,to.y,clearance].join('/'),copy=path=>path?.map(p=>({...p}))??null;if(key&&this.routes.has(key))return copy(this.routes.get(key));
  const coarse=this.coarseRoute(from,to,clearance,allowed),length=path=>{let total=0,previous=from;for(const p of path){total+=Math.hypot(wrap(p.x-previous.x),p.y-previous.y);previous=p;}return total;},direct=Math.hypot(wrap(to.x-from.x),to.y-from.y);
  // Fine search is a coastal connector, never a continental/ocean-sized grid.
  let result=coarse;if(direct<=12&&(!coarse||clearance<COAST_MARGIN&&length(coarse)>direct*1.3+.5)){const fine=this.fineRoute(from,to,clearance,allowed);if(fine&&(!coarse||length(fine)<length(coarse)))result=fine;}
  if(key){if(this.routes.size>=256)this.routes.delete(this.routes.keys().next().value);this.routes.set(key,copy(result));}return copy(result);
 }

 fineRoute(from,to,clearance=PASSAGE_MARGIN,allowed=null){
  if(this.land(from.x,from.y)||!this.navigable(to.x,to.y,clearance)||allowed&&!allowed(to.x,to.y))return null;
  const step=.1,dx=wrap(to.x-from.x),pad=3,minX=Math.floor((Math.min(0,dx)-pad)/step),maxX=Math.ceil((Math.max(0,dx)+pad)/step),minY=Math.max(Math.ceil((-79-from.y)/step),Math.floor((Math.min(from.y,to.y)-from.y-pad)/step)),maxY=Math.min(Math.floor((80-from.y)/step),Math.ceil((Math.max(from.y,to.y)-from.y+pad)/step)),cols=maxX-minX+1;
  const point=(x,y)=>({x:wrap(from.x+x*step),y:from.y+y*step}),id=(x,y)=>(y-minY)*cols+x-minX,decode=key=>({x:key%cols+minX,y:Math.floor(key/cols)+minY}),water=new Map(),cost=new Map(),prev=new Map(),closed=new Set(),heap=[];
  const push=node=>{heap.push(node);let i=heap.length-1;while(i){const parent=(i-1)>>1;if(heap[parent].f<=node.f)break;heap[i]=heap[parent];i=parent;}heap[i]=node;};
  const pop=()=>{const first=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let child=i*2+1;if(child+1<heap.length&&heap[child+1].f<heap[child].f)child++;if(heap[child].f>=last.f)break;heap[i]=heap[child];i=child;}heap[i]=last;}return first;};
  const legal=(x,y)=>{const key=id(x,y);if(!water.has(key)){const p=point(x,y);water.set(key,this.navigable(p.x,p.y,clearance)&&(!allowed||allowed(p.x,p.y)));}return water.get(key);},heuristic=p=>Math.hypot(dx-p.x*step,to.y-from.y-p.y*step)/step;
  for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++){if(x<minX||x>maxX||y<minY||y>maxY)continue;const p=point(x,y);if(!legal(x,y)||!this.clear(from,p,clearance,allowed))continue;const g=Math.hypot(x,y),key=id(x,y);cost.set(key,g);push({x,y,key,g,f:g+heuristic({x,y})});}
  let finish=null;while(heap.length&&closed.size<10000){const p=pop();if(closed.has(p.key)||p.g!==cost.get(p.key))continue;closed.add(p.key);const here=point(p.x,p.y);if(heuristic(p)<=5&&this.clear(here,to,clearance,allowed)){finish=p.key;break;}
   for(let y=p.y-1;y<=p.y+1;y++)for(let x=p.x-1;x<=p.x+1;x++){if(x===p.x&&y===p.y||x<minX||x>maxX||y<minY||y>maxY)continue;const key=id(x,y);if(closed.has(key)||!legal(x,y))continue;const g=p.g+Math.hypot(x-p.x,y-p.y);if(g>=(cost.get(key)??Infinity)||!this.clear(here,point(x,y),clearance,allowed))continue;cost.set(key,g);prev.set(key,p.key);push({x,y,key,g,f:g+heuristic({x,y})});}
  }
  if(finish===null)return null;const path=[{...to}];for(let key=finish;key!==undefined;key=prev.get(key)){const p=decode(key);path.unshift(point(p.x,p.y));}const result=[];let anchor=from;while(path.length){let far=-1;for(let i=path.length-1;i>=0;i--)if(this.clear(anchor,path[i],clearance,allowed)){far=i;break;}if(far<0)return null;anchor=path[far];result.push(anchor);path.splice(0,far+1);}return result;
 }

}
