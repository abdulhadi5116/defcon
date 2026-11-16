// Snapshot JSON, compression and recovery storage run off the rendering thread.
export async function packSave(serialized){let body=new Blob([serialized]),encoding=null;if(typeof CompressionStream!=='undefined'){body=await new Response(body.stream().pipeThrough(new CompressionStream('gzip'))).blob();encoding='gzip';}return {body,encoding};}
let recoveryDb;
async function database(){if(!recoveryDb)recoveryDb=new Promise((resolve,reject)=>{const r=indexedDB.open('blackout-recovery',1);r.onupgradeneeded=()=>r.result.createObjectStore('pending');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});return recoveryDb;}
export async function recovery(action,value){
 if(typeof indexedDB==='undefined'){try{if(action==='read')return JSON.parse(localStorage.getItem('blackout-pending'));if(action==='write')localStorage.setItem('blackout-pending',JSON.stringify(value));if(action==='clear'){const old=JSON.parse(localStorage.getItem('blackout-pending'));if(!value||old?.id===value)localStorage.removeItem('blackout-pending');}}catch{}return null;}
 try{const db=await database();return await new Promise((resolve,reject)=>{const tx=db.transaction('pending',action==='read'?'readonly':'readwrite'),store=tx.objectStore('pending');let result=null;const r=action==='write'?store.put(value,'current'):store.get('current');r.onsuccess=()=>{result=r.result;if(action==='clear'&&(!value||result?.id===value))store.delete('current');};tx.oncomplete=()=>resolve(action==='read'?(result??null):null);tx.onerror=()=>reject(tx.error);});}catch{return null;}
}
export async function prepareSave({snapshot,metadata,journal}){const serialized=JSON.stringify(snapshot);if(journal)await recovery('write',{...journal,snapshot:typeof document==='undefined'?snapshot:JSON.parse(serialized)});const prefix=JSON.stringify(metadata);const encoded=await packSave(prefix.slice(0,-1)+',"snapshot":'+serialized+'}');return {...encoded,serialized};}
export class SaveEncoder {
 constructor(){this.jobs=new Map();this.next=0;try{if(typeof Worker!=='undefined'){this.worker=new Worker(new URL('./save-worker.js',import.meta.url),{type:'module'});this.worker.onmessage=({data})=>{const job=this.jobs.get(data.id);if(!job)return;this.jobs.delete(data.id);data.error?job.reject(Error(data.error)):job.resolve(data.result);};this.worker.onerror=()=>{for(const job of this.jobs.values())job.reject(Error('Save worker failed. Retry saving.'));this.jobs.clear();this.worker.terminate();this.worker=null;};}}catch{this.worker=null;}}
 call(kind,data){if(this.worker)return new Promise((resolve,reject)=>{const id=++this.next;this.jobs.set(id,{resolve,reject});try{this.worker.postMessage({id,kind,data});}catch(error){this.jobs.delete(id);reject(error);}});if(kind==='prepare')return prepareSave(data);if(kind==='encode')return packSave(JSON.stringify(data));return recovery(kind,data);}
 prepare(snapshot,metadata,journal=null){return this.call('prepare',{snapshot,metadata,journal});}
 encode(data){return this.call('encode',data);}
 readRecovery(){return this.call('read');}
 clearRecovery(id){return this.call('clear',id);}
}
