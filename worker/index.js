import {sessionApi} from '../server/api.js';
export default {async fetch(request,env){const response=await sessionApi(request,env.DB);if(response)return response;return env.ASSETS.fetch(request);}};
