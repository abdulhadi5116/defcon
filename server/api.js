import {MAX_REQUEST_BYTES} from './snapshot-codec.js';
import {validateSnapshot,validatePreferences} from '../public/save-state.js';
import {SessionStore} from './store.js';
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function body(request){let stream=request.body;if(!stream)throw Error('Missing request body.');if(request.headers.get('Content-Encoding')==='gzip')stream=stream.pipeThrough(new DecompressionStream('gzip'));const reader=stream.getReader(),parts=[];let size=0;for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_REQUEST_BYTES){await reader.cancel();const error=Error('Save exceeds the 16 MB request limit.');error.status=413;throw error;}parts.push(value);}const bytes=new Uint8Array(size);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}return JSON.parse(new TextDecoder().decode(bytes));}
export async function sessionApi(request,db){
 try{const url=new URL(request.url);if(!url.pathname.startsWith('/api/'))return null;if(!db)return json({error:'Session database unavailable.'},503);const store=new SessionStore(db);if(url.pathname==='/api/preferences'&&request.method==='PUT'){const origin=request.headers.get('Origin');if(origin&&origin!==url.origin)return json({error:'Cross-origin writes rejected.'},403);const data=await body(request);validatePreferences(data);await store.preferences({preferences:data.preferences,view:data.view}).run();return json({saved:true});}const match=url.pathname.match(/^\/api\/sessions(?:\/([a-f0-9-]{36})(\/claim)?)?$/);if(!match)return json({error:'Not found.'},404);
  if(request.method==='GET'){if(!match[1])return json(await store.list());const saved=await store.get(match[1]);return saved?json(saved):json({error:'Session not found.'},404);}
  if(!['POST','PUT'].includes(request.method))return json({error:'Method not allowed.'},405);
  const origin=request.headers.get('Origin');if(origin&&origin!==url.origin)return json({error:'Cross-origin writes rejected.'},403);
  const data=await body(request);if(typeof data.writer!=='string'||!data.writer.match(/^[a-f0-9-]{36}$/))return json({error:'Invalid browser controller.'},400);
  if(request.method==='POST'&&match[2]){const saved=await store.claim(match[1],data.writer);return saved?json(saved):json({error:'Session not found.'},404);}
  validateSnapshot(data.snapshot);
  if(request.method==='POST'&&!match[1]){const name=typeof data.name==='string'?data.name.trim():'';if(!name||name.length>64)return json({error:'Session name must contain 1–64 characters.'},400);return json(await store.create(name,data.snapshot,data.writer),201);}
  if(request.method==='PUT'&&match[1]&&!match[2]){if(!Number.isInteger(data.revision)||data.revision<1)return json({error:'Invalid save revision.'},400);const saved=await store.save(match[1],data.revision,data.writer,data.snapshot);return saved?json(saved):json({error:'This session continued in another browser. Select Continue here to take control again.',conflict:true},409);}
  return json({error:'Method not allowed.'},405);
 }catch(error){if(error.status===413)return json({error:error.message},413);if(error instanceof SyntaxError||/save|simulation|unit|faction|view|body|browser|format|nesting/i.test(error.message))return json({error:error.message},400);console.error('Session storage error:',error.message);return json({error:'Unable to store session. Your current game is still in this browser; retry saving.'},500);}
}
