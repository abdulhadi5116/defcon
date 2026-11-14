"""Build ten game regions from retained masks and Natural Earth admin-0 country geometry.
Inputs: legacy JSON export, Natural Earth countries GeoJSON, populated places GeoJSON.
"""
from PIL import Image,ImageDraw
from collections import deque
import json,sys,ast
from pathlib import Path
root=Path(__file__).resolve().parents[1]
legacy=json.load(open(sys.argv[1]));countries=json.load(open(sys.argv[2]));places=json.load(open(sys.argv[3]))
W,H=512,285
owner=[-1]*(W*H)
for i,r in enumerate(legacy['masks'][:5]):
 for y,row in enumerate(r['rows']):
  for a,b,v in row:
   if v==2:
    for x in range(a,b):owner[y*W+x]=i
blocks={5:'IND PAK BGD NPL LKA BTN MDV',6:'IRN AFG IRQ SYR LBN ISR PSX JOR SAU YEM OMN ARE QAT BHR KWT',7:'CHN TWN JPN KOR PRK MNG',8:'MMR THA VNM LAO KHM MYS SGP IDN PHL BRN TLS',9:'AUS NZL',3:'KAZ UZB TKM TJK KGZ GEO ARM AZE',2:'TUR'}
country_team={c:i for i,codes in blocks.items() for c in codes.split()}
for f in countries['features']:
 code=f['properties']['ADM0_A3'];team=country_team.get(code)
 if team is None:continue
 mask=Image.new('1',(W,H));draw=ImageDraw.Draw(mask)
 polys=[f['geometry']['coordinates']] if f['geometry']['type']=='Polygon' else f['geometry']['coordinates']
 for poly in polys:
  for j,ring in enumerate(poly):draw.polygon([((x+180)/360*W,(100-y)/360*W) for x,y in ring],fill=1 if j==0 else 0)
 for k,v in enumerate(mask.getdata()):
  if v:owner[k]=team
land=owner[:];dist=[0 if v>=0 else 999 for v in owner];q=deque(k for k,v in enumerate(owner) if v>=0)
while q:
 k=q.popleft()
 if dist[k]>=18:continue
 x,y=k%W,k//W
 for nx,ny in [((x-1)%W,y),((x+1)%W,y),(x,y-1),(x,y+1)]:
  if not 0<=ny<H:continue
  n=ny*W+nx
  if dist[n]>dist[k]+1:dist[n]=dist[k]+1;owner[n]=owner[k];q.append(n)
# Reuse the retained boundary tracing/simplification algorithm, without running its CLI.
source=ast.parse((root/'tools/extract-territories.py').read_text());functions=[n for n in source.body if isinstance(n,ast.FunctionDef)]
exec(compile(ast.Module(body=functions,type_ignores=[]),'<boundary-functions>','exec'))
ids=['northamerica','southamerica','europe','russia','africa','southasia','iran','china','southeastasia','australia']
regions=[]
for i,id in enumerate(ids):
 rows=[];cells=set();water=set()
 for y in range(H):
  row=[];start=0;last=0
  for x in range(W+1):
   k=y*W+x;v=(2 if land[k]==i else 1 if owner[k]==i else 0) if x<W else 0
   if v:water.add((x,y))
   if v==2:cells.add((x,y))
   if v!=last:
    if last:row.append([start,x,last])
    start=x;last=v
  rows.append(row)
 regions.append({'id':id,'width':W,'height':H,'rows':rows,'rings':outlines(cells,W),'maritimeRings':outlines(water,W)})
newcities=[[] for _ in ids]
for i in range(5):newcities[i]=legacy['cities'][i]
for f in places['features']:
 p=f['properties'];i=country_team.get(p.get('adm0_a3'))
 if i is None or i<5:continue
 pop=p.get('pop_max') or 0
 if pop<=0:continue
 x,y=f['geometry']['coordinates'];newcities[i].append([p['name'],round(x,6),round(y,6),round(pop/1e6,6)])
for i in range(5,10):newcities[i]=sorted(newcities[i],key=lambda c:-c[3])[:25]
(root/'public/expanded-territory-data.js').write_text('// Game territory raster. Country geometry: Natural Earth (public domain). See research/WORLD_EXPANSION.md.\nexport const WORLD_TERRITORY_MASKS='+json.dumps(regions,separators=(',',':'))+';\nexport const WORLD_CITIES='+json.dumps(newcities,separators=(',',':'))+';\n')
print('Generated',len(regions),'regions; city counts:',list(map(len,newcities)))
