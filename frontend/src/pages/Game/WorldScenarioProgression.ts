export const REGION1_MAIN_PATH = [
  "monastery","lower-road","forest-pass","forest-camp","pine-clearing","hunter-hut","mist-lake","waterfall-path","hidden-cave","high-trail","mist-forest","forest-shrine","old-quarry","mine-entrance","deep-mine","old-bridge","river-crossing","stone-circle","graveyard","watchtower","watchtower-cellar","north-ridge","mountain-pass","bear-lookout","bear-outpost-west","abandoned-village","village-cellar","old-chapel","bear-camp","bear-supply-yard","dark-gate"
] as const;

const SIDE_BRANCHES: Record<string,string[]> = {
  "lower-road":["monastery-cliffs","eagle-ledge"],
  "forest-pass":["broken-cart"],
  "mist-lake":["fog-marsh"],
  "north-ridge":["north-lookout"]
};

export function scenarioIndex(locationId:string){
  return REGION1_MAIN_PATH.indexOf(locationId as typeof REGION1_MAIN_PATH[number]);
}

export function scenarioAllowedDestinations(currentId:string, visited:string[]){
  const allowed=new Set<string>();
  const index=scenarioIndex(currentId);
  if(index>=0){
    if(index>0) allowed.add(REGION1_MAIN_PATH[index-1]);
    const next=REGION1_MAIN_PATH[index+1]; if(next) allowed.add(next);
    (SIDE_BRANCHES[currentId]??[]).forEach(id=>allowed.add(id));
  } else {
    Object.entries(SIDE_BRANCHES).forEach(([parent,children])=>{ if(children.includes(currentId)) allowed.add(parent); });
  }
  visited.forEach(id=>{
    const targetIndex=scenarioIndex(id);
    if(index>=0 && targetIndex>=0 && Math.abs(targetIndex-index)<=1) allowed.add(id);
  });
  return [...allowed];
}

export function scenarioTravelAllowed(currentId:string,targetId:string,visited:string[]){
  if(currentId===targetId) return true;
  return scenarioAllowedDestinations(currentId,visited).includes(targetId);
}
