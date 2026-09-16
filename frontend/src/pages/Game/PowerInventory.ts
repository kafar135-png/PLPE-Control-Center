export type PowerId = "frost"|"guard"|"sleep"|"storm"|"renewal";
export interface CraftedPower { id:PowerId; level:number; charges:number; }
export interface PowerState { crafted:CraftedPower[]; equipped:PowerId[]; }
const KEY="plpe-power-inventory-v2";
const DEFAULT:PowerState={crafted:[],equipped:[]};
export function loadPowerState():PowerState{try{return {...DEFAULT,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return {...DEFAULT}}}
export function savePowerState(state:PowerState){localStorage.setItem(KEY,JSON.stringify(state));window.dispatchEvent(new CustomEvent("plpe-power-state-sync",{detail:state}));return state}
export function hasPower(state:PowerState,id:PowerId){return state.crafted.some(x=>x.id===id)}
export function craftPower(state:PowerState,id:PowerId,charges=3){if(hasPower(state,id))return state;return savePowerState({...state,crafted:[...state.crafted,{id,level:1,charges}]})}
export function upgradePower(state:PowerState,id:PowerId){return savePowerState({...state,crafted:state.crafted.map(p=>p.id===id?{...p,level:p.level+1,charges:p.charges+1}:p)})}
export function toggleEquipPower(state:PowerState,id:PowerId){const has=state.equipped.includes(id);const equipped=has?state.equipped.filter(x=>x!==id):state.equipped.length<3?[...state.equipped,id]:[state.equipped[1],state.equipped[2],id];return savePowerState({...state,equipped})}
export function consumePowerCharge(state:PowerState,id:PowerId){const item=state.crafted.find(p=>p.id===id);if(!item||item.charges<=0)return state;return savePowerState({...state,crafted:state.crafted.map(p=>p.id===id?{...p,charges:p.charges-1}:p)})}
