import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {Readable} from 'node:stream';
import {timingSafeEqual} from 'node:crypto';
import {openDatabase} from './server/sqlite.js';
import {sessionApi} from './server/api.js';
const root=path.resolve('public'),db=openDatabase(path.resolve(process.env.DATA_DIR||'data'));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.ogg':'audio/ogg'};
const server=http.createServer(async(req,res)=>{try{
 if(process.env.GAME_PASSWORD){const supplied=Buffer.from((req.headers.authorization||'').replace(/^Basic /,''),'base64').toString().split(':').slice(1).join(':'),a=Buffer.from(supplied),b=Buffer.from(process.env.GAME_PASSWORD);if(a.length!==b.length||!timingSafeEqual(a,b)){res.writeHead(401,{'WWW-Authenticate':'Basic realm="DEFCON command"'}).end('Sign in required.');return;}}
 const url=new URL(req.url,(req.headers['x-forwarded-proto']==='https'?'https://':'http://')+req.headers.host),pathname=decodeURIComponent(url.pathname);
 if(pathname.startsWith('/api/')){const request=new Request(url,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Readable.toWeb(req),duplex:'half'})}),response=await sessionApi(request,db);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;}
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}).end(data);
 }catch{res.writeHead(404).end('Not found');}}).listen(Number(process.env.PORT)||5186,process.env.HOST||'0.0.0.0',function(){console.log(`DEFCON: BLACKOUT · http://localhost:${this.address().port}`)});
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>{db.close();process.exit(0);}));
