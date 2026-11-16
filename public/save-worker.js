import {packSave,prepareSave,recovery} from './save-encoder.js';
self.onmessage=async({data:{id,kind,data}})=>{try{const result=kind==='prepare'?await prepareSave(data):kind==='encode'?await packSave(JSON.stringify(data)):await recovery(kind,data);self.postMessage({id,result});}catch(error){self.postMessage({id,error:error.message});}};
