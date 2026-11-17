// One-time clean start requested by the owner; subsequent games keep their saves.
export const RESET_REVISION='2026-11-17-fresh-start-1';
export function resetLocalState(storage=globalThis.localStorage,session=globalThis.sessionStorage){
 try{if(!storage||storage.getItem('blackout-reset-revision')===RESET_REVISION)return false;for(const key of ['blackout-settings','blackout-operation','blackout-view','blackout-pending'])storage.removeItem(key);session?.removeItem('blackout-controller');storage.setItem('blackout-reset-revision',RESET_REVISION);return true;}catch{return false;}
}
