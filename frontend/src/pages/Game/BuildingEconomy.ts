export type PowerId = "frost-rune" | "guardian-sigil" | "storm-core" | "sleep-dust" | "healing-totem";

export interface BuildingResources {
  memeEnergy: number;
  relics: number;
  intel: number;
  bearFragments: number;
  comicFragments: number;
  cardFragments: number;
  crowns: number;
}

export interface CraftedPower { id: PowerId; level: number; charges: number; }

export interface BuildingGameplayState {
  levels: { trainingHall: number; cardForge: number; comicArchive: number; plpeVault: number; arena: number; expeditions: number; };
  resources: BuildingResources;
  powers: CraftedPower[];
  unlockedRecipes: PowerId[];
  discoveredLore: string[];
}

const KEY = "plpe-building-gameplay-v1";

export const POWER_RECIPES = [
  { id:"frost-rune" as const, name:"Runa Mrozu", description:"Zamraża 1 wroga na turę.", cost:{relics:2, cardFragments:2, crowns:80}, forge:1 },
  { id:"guardian-sigil" as const, name:"Pieczęć Strażnika", description:"Mocna tarcza dla Pepe lub Bociana.", cost:{relics:3, bearFragments:3, crowns:120}, forge:1 },
  { id:"storm-core" as const, name:"Rdzeń Burzy", description:"Łańcuchowy piorun w maks. 3 cele.", cost:{relics:5, cardFragments:5, crowns:220}, forge:2 },
  { id:"sleep-dust" as const, name:"Pył Snu", description:"Usypia 1 przeciwnika.", cost:{comicFragments:2, cardFragments:3, crowns:140}, forge:2 },
  { id:"healing-totem" as const, name:"Totem Odnowy", description:"Leczy drużynę przez 2 tury.", cost:{relics:4, comicFragments:2, crowns:180}, forge:3 },
];

export function defaultBuildingState(): BuildingGameplayState {
  return {
    levels:{trainingHall:1,cardForge:1,comicArchive:1,plpeVault:1,arena:1,expeditions:1},
    resources:{memeEnergy:150,relics:2,intel:1,bearFragments:2,comicFragments:0,cardFragments:1,crowns:100},
    powers:[], unlockedRecipes:["frost-rune","guardian-sigil"], discoveredLore:[],
  };
}

export function loadBuildingState(): BuildingGameplayState {
  try {
    const raw=localStorage.getItem(KEY); if(!raw) return defaultBuildingState();
    const parsed=JSON.parse(raw); const fallback=defaultBuildingState();
    return { ...fallback, ...parsed, levels:{...fallback.levels,...parsed.levels}, resources:{...fallback.resources,...parsed.resources} };
  } catch { return defaultBuildingState(); }
}

export function saveBuildingState(state: BuildingGameplayState) { localStorage.setItem(KEY,JSON.stringify(state)); return state; }

export function addResources(state: BuildingGameplayState, reward: Partial<BuildingResources>) {
  const resources={...state.resources};
  (Object.keys(reward) as (keyof BuildingResources)[]).forEach((key)=>{ resources[key]=Math.max(0,resources[key]+(reward[key]??0)); });
  return saveBuildingState({...state,resources});
}

export function canCraftPower(state: BuildingGameplayState, id: PowerId) {
  const recipe=POWER_RECIPES.find(r=>r.id===id);
  if(!recipe || state.levels.cardForge<recipe.forge || !state.unlockedRecipes.includes(id)) return false;
  return Object.entries(recipe.cost).every(([k,v])=>state.resources[k as keyof BuildingResources] >= v);
}

export function craftPower(state: BuildingGameplayState, id: PowerId) {
  const recipe=POWER_RECIPES.find(r=>r.id===id); if(!recipe || !canCraftPower(state,id)) return state;
  const resources={...state.resources}; Object.entries(recipe.cost).forEach(([k,v])=>resources[k as keyof BuildingResources]-=v);
  const current=state.powers.find(p=>p.id===id);
  const powers=current ? state.powers.map(p=>p.id===id?{...p,charges:p.charges+1}:p) : [...state.powers,{id,level:1,charges:1}];
  return saveBuildingState({...state,resources,powers});
}

export function upgradeBuilding(state: BuildingGameplayState, building: keyof BuildingGameplayState["levels"]) {
  const level=state.levels[building]; const costEnergy=100*level; const costCrowns=80*level;
  if(state.resources.memeEnergy<costEnergy || state.resources.crowns<costCrowns) return state;
  const next:BuildingGameplayState={...state,levels:{...state.levels,[building]:level+1},resources:{...state.resources,memeEnergy:state.resources.memeEnergy-costEnergy,crowns:state.resources.crowns-costCrowns}};
  if(building==="cardForge" && level+1>=2) next.unlockedRecipes=[...new Set([...next.unlockedRecipes,"storm-core","sleep-dust"])] as PowerId[];
  if(building==="cardForge" && level+1>=3) next.unlockedRecipes=[...new Set([...next.unlockedRecipes,"healing-totem"])] as PowerId[];
  return saveBuildingState(next);
}
