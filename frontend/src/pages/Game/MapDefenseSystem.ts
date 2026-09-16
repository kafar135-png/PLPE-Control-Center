import { awardGlobalReward, spendGlobalResources } from "./Progress";

export interface PlayerTower {
  locationId: string;
  level: number;
  guards: number;
  maxGuards: number;
}
export interface MapDefenseState { towers: Record<string,PlayerTower>; }
const KEY="plpe-map-defense-v1";
export const TOWER_BUILD_COST={memeEnergy:60,relics:1,crowns:40};
export const GUARD_COST={memeEnergy:15,crowns:35};
export function loadMapDefenseState():MapDefenseState{try{return {towers:{},...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return{towers:{}}}}
export function saveMapDefenseState(state:MapDefenseState){localStorage.setItem(KEY,JSON.stringify(state));window.dispatchEvent(new CustomEvent("plpe-map-defense-sync",{detail:state}));return state}
export function buildPlayerTower(state:MapDefenseState,locationId:string){if(state.towers[locationId])return state;if(!spendGlobalResources(TOWER_BUILD_COST))return state;return saveMapDefenseState({towers:{...state.towers,[locationId]:{locationId,level:1,guards:0,maxGuards:3}}})}
export function recruitGuard(state:MapDefenseState,locationId:string){const tower=state.towers[locationId];if(!tower||tower.guards>=tower.maxGuards)return state;if(!spendGlobalResources(GUARD_COST))return state;return saveMapDefenseState({towers:{...state.towers,[locationId]:{...tower,guards:tower.guards+1}}})}
export function consumeTowerGuard(state:MapDefenseState,locationId:string){const tower=state.towers[locationId];if(!tower||tower.guards<=0)return state;return saveMapDefenseState({towers:{...state.towers,[locationId]:{...tower,guards:tower.guards-1}}})}
export function rewardTowerDefense(){awardGlobalReward({intel:1,crowns:10})}
