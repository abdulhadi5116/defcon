// Water routing uses the same coastline geometry as the retained map.
export class Navigation {
 constructor(geojson){this.polygons=geojson.features.flatMap(f=>f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates);this.regions=this.polygons.map(p=>({p,minX:Math.min(...p[0].map(v=>v[0])),maxX:Math.max(...p[0].map(v=>v[0])),minY:Math.min(...p[0].map(v=>v[1])),maxY:Math.max(...p[0].map(v=>v[1]))}));this.cache=new Map();this.step=2;this.cols=180;this.rows=80;}
 inRing(x,y,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
 land(x,y){return this.regions.some(({p,minX,maxX,minY,maxY})=>x>=minX&&x<=maxX&&y>=minY&&y<=maxY&&this.inRing(x,y,p[0])&&!p.slice(1).some(r=>this.inRing(x,y,r)));}
 waterNode(x,y){const key=y*this.cols+x;if(!this.cache.has(key))this.cache.set(key,!this.land(-179+x*2,-79+y*2));return this.cache.get(key);}
 node(p){return {x:Math.max(0,Math.min(179,Math.round((p.x+179)/2))),y:Math.max(0,Math.min(79,Math.round((p.y+79)/2)))};}
 clear(a,b){const length=Math.hypot(b.x-a.x,b.y-a.y),steps=Math.ceil(length/.5);for(let i=1;i<=steps;i++)if(this.land(a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps))return false;return true;}
 route(from,to){if(this.land(to.x,to.y))return null;if(this.clear(from,to))return [{...to}];const start=this.node(from),end=this.node(to),id=p=>p.y*this.cols+p.x,goal=id(end),cost=new Map([[id(start),0]]),prev=new Map(),open=[{...start,f:0}],closed=new Set();let found=false;
  while(open.length){let index=0;for(let i=1;i<open.length;i++)if(open[i].f<open[index].f)index=i;const p=open.splice(index,1)[0],key=id(p);if(closed.has(key))continue;if(key===goal){found=true;break;}closed.add(key);if(closed.size>14500)break;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const n={x:p.x+dx,y:p.y+dy};if(n.x<0||n.x>=180||n.y<0||n.y>=80||!this.waterNode(n.x,n.y))continue;const nk=id(n);if(closed.has(nk))continue;if(dx&&dy&&(!this.waterNode(p.x+dx,p.y)||!this.waterNode(p.x,p.y+dy)))continue;const next=cost.get(key)+Math.hypot(dx,dy);if(next>=(cost.get(nk)??Infinity))continue;cost.set(nk,next);prev.set(nk,key);open.push({...n,f:next+Math.hypot(n.x-end.x,n.y-end.y)});}
  }
  if(!found)return null;let key=goal,path=[];while(key!==id(start)){path.unshift({x:-179+(key%180)*2,y:-79+Math.floor(key/180)*2});key=prev.get(key);if(key===undefined)return null;}path.push({...to});const result=[];let anchor=from;while(path.length){let far=0;for(let i=path.length-1;i>=0;i--)if(this.clear(anchor,path[i])){far=i;break;}anchor=path[far];result.push(anchor);path=path.slice(far+1);}return result;
 }
}
