import {realtimeProxy} from '../server/realtime/proxy.js';
import {sessionApi} from '../server/api.js';
export default {async fetch(request,env){const live=await realtimeProxy(request,env);if(live)return live;const response=await sessionApi(request,env.DB);if(response)return response;return env.ASSETS.fetch(request);}};
