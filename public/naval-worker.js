import {Navigation} from './navigation.js';
import {planNavalRoute} from './naval-planning.js';
let navigation;
self.onmessage=({data})=>{if(data.kind==='init'){navigation=new Navigation(data.land);return;}try{self.postMessage({id:data.id,result:planNavalRoute(data,navigation)});}catch(error){self.postMessage({id:data.id,error:error.message});}};
