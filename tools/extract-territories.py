"""Derive land and maritime boundaries from user-supplied v1.43 territory masks."""
from PIL import Image
from pathlib import Path
import json,hashlib,sys
source=Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/defcon-v143-reference/main/data/earth')
output=Path(__file__).resolve().parents[1]/'dist/territory-data.js'
def simplify(points,eps=.7):
    if len(points)<3:return points
    a,b=points[0],points[-1];dx,dy=b[0]-a[0],b[1]-a[1];den=(dx*dx+dy*dy)**.5
    distances=[abs(dy*(p[0]-a[0])-dx*(p[1]-a[1]))/den if den else ((p[0]-a[0])**2+(p[1]-a[1])**2)**.5 for p in points]
    index=max(range(len(points)),key=lambda i:distances[i])
    if distances[index]<=eps:return [a,b]
    return simplify(points[:index+1],eps)[:-1]+simplify(points[index:],eps)
def outlines(mask,width):
    edges={}
    for x,y in mask:
        for neighbor,a,b in [((x,y-1),(x,y),(x+1,y)),((x+1,y),(x+1,y),(x+1,y+1)),((x,y+1),(x+1,y+1),(x,y+1)),((x-1,y),(x,y+1),(x,y))]:
            if neighbor not in mask:edges.setdefault(a,[]).append(b)
    rings=[]
    while edges:
        start=next(iter(edges));point=start;ring=[point]
        for _ in range(100000):
            if point not in edges:break
            nxt=edges[point].pop()
            if not edges[point]:del edges[point]
            point=nxt;ring.append(point)
            if point==start:break
        area=abs(sum(ring[i][0]*ring[i+1][1]-ring[i+1][0]*ring[i][1] for i in range(len(ring)-1)))/2
        if len(ring)>4 and area>=3:
            half=len(ring)//2;simple=simplify(ring[:half+1])[:-1]+simplify(ring[half:]);rings.append([[round(-180+x*360/width,3),round(100-y*360/width,3)] for x,y in simple])
    return sorted(rings,key=lambda r:(min(p[0] for p in r),min(p[1] for p in r)))
regions=[]
for name in ['northamerica','southamerica','europe','russia','africa','southasia']:
    path=source/(name+'.bmp');im=Image.open(path).convert('L');width,height=im.size;pixels=im.load();rows=[];land=set();allowed=set()
    for y in range(height):
        runs=[];start=0;last=0
        for x in range(width+1):
            value=(2 if pixels[x,y]>=200 else 1 if pixels[x,y]>=70 else 0) if x<width else 0
            if value==2:land.add((x,y))
            if value:allowed.add((x,y))
            if value!=last:
                if last:runs.append([start,x,last])
                start=x;last=value
        rows.append(runs)
    regions.append({'id':name,'width':width,'height':height,'rows':rows,'rings':outlines(land,width),'maritimeRings':outlines(allowed,width),'source_sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
output.write_text('// Derived from original v1.43 territory bitmaps. Projection: 360 degrees / 512 pixels, top latitude 100.\nexport const TERRITORY_MASKS='+json.dumps(regions,separators=(',',':'))+';\n')
print('Wrote',output.stat().st_size,'bytes of land and maritime territory data')
