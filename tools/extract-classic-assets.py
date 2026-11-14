"""Extract user-supplied DEFCON installer data without executing its code.
Usage: python3 tools/extract-classic-assets.py /absolute/path/defcon-win32-v143.exe
Requires innoextract, unar and Pillow. Audio files are copied byte for byte.
"""
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from PIL import Image

source=Path(sys.argv[1]).expanduser().resolve()
root=Path(__file__).resolve().parents[1]
out=root/'public/assets/classic'
with tempfile.TemporaryDirectory(prefix='defcon-assets-') as folder:
    temp=Path(folder)
    subprocess.run(['innoextract','--extract','--output-dir',str(temp/'installer'),str(source)],check=True)
    for name in ['main','sounds']:
        subprocess.run(['unar','-quiet','-force-overwrite','-output-directory',str(temp/name),str(temp/'installer/app'/f'{name}.dat')],check=True)
    manifest={'version':'DEFCON v1.43','source':'User-provided '+source.name,'installer_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'units':{},'audio':{}}
    (out/'units').mkdir(parents=True,exist_ok=True)
    (out/'audio').mkdir(parents=True,exist_ok=True)
    names=['battleship','carrier','sub','sub_surfaced','fighter','bomber','silo','airbase','radarstation','nuke','sam','smallnuke','smallfighter','smallbomber','explosion','city','fleet']
    for name in names:
        original=temp/'main/data/graphics'/f'{name}.bmp'
        luminance=Image.open(original).convert('L')
        rgba=Image.new('RGBA',luminance.size,'white')
        rgba.putalpha(luminance)
        dest=out/'units'/f'{name}.png'
        rgba.save(dest)
        manifest['units'][name]={'original':f'data/graphics/{name}.bmp','original_sha256':hashlib.sha256(original.read_bytes()).hexdigest(),'path':str(dest.relative_to(root/'public')),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'conversion':'RGB luminance to alpha; original pixels and dimensions retained'}
    for original in sorted((temp/'sounds/data/sounds').glob('*.ogg')):
        dest=out/'audio'/original.name
        shutil.copyfile(original,dest)
        manifest['audio'][original.stem]={'path':str(dest.relative_to(root/'public')),'sha256':hashlib.sha256(original.read_bytes()).hexdigest(),'bytes':original.stat().st_size}
    (out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(f"Exported {len(manifest['units'])} textures and {len(manifest['audio'])} original OGG files.")
