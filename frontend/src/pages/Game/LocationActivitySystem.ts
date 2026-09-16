export type ActivityGameType = "runes" | "memory" | "relic-hunt" | "tictactoe";
export interface LocationMiniActivity { id:string; locationId:string; type:ActivityGameType; title:string; description:string; rewardText:string; }

export const LOCATION_MINI_ACTIVITIES:LocationMiniActivity[]=[
  {id:"lower-road-runes",locationId:"lower-road",type:"runes",title:"Kamienie drogi",description:"Ustaw symbole w kolejności pokazanej przez Bociana.",rewardText:"+20 Energy"},
  {id:"forest-pass-memory",locationId:"forest-pass",type:"memory",title:"Znaki Zwiadowcy",description:"Zapamiętaj sekwencję śladów i odtwórz ją.",rewardText:"+1 Intel"},
  {id:"forest-camp-hunt",locationId:"forest-camp",type:"relic-hunt",title:"Przeszukanie obozu",description:"Znajdź ukryty fragment między skrzyniami.",rewardText:"+1 Bear Fragment"},
  {id:"mist-lake-runes",locationId:"mist-lake",type:"runes",title:"Pieczęć Jeziora",description:"Dopasuj runy do odbicia w wodzie.",rewardText:"+1 Relikt"},
  {id:"hidden-cave-memory",locationId:"hidden-cave",type:"memory",title:"Echo jaskini",description:"Powtórz rytm świetlnych kryształów.",rewardText:"+1 Card Fragment"},
  {id:"old-bridge-ttt",locationId:"old-bridge",type:"tictactoe",title:"Stara tablica",description:"Pokonaj strażnika w kółko i krzyżyk.",rewardText:"+35 Koron"},
  {id:"stone-circle-runes",locationId:"stone-circle",type:"runes",title:"Krąg kamieni",description:"Obróć pieczęcie, aby aktywować środkowy kamień.",rewardText:"+1 Comic Fragment"},
  {id:"watchtower-hunt",locationId:"watchtower",type:"relic-hunt",title:"Zaginiony raport",description:"Przeszukaj wieżę i znajdź właściwy dokument.",rewardText:"+2 Intel"},
  {id:"abandoned-village-memory",locationId:"abandoned-village",type:"memory",title:"Światła opuszczonej osady",description:"Odtwórz kolejność świateł w oknach.",rewardText:"+50 Energy"},
  {id:"bear-camp-hunt",locationId:"bear-camp",type:"relic-hunt",title:"Sabotaż zapasów",description:"Znajdź trzy oznaczone skrzynie bez wszczynania alarmu.",rewardText:"+2 Bear Fragments"},
];

export function activitiesForLocation(locationId:string){ return LOCATION_MINI_ACTIVITIES.filter(a=>a.locationId===locationId); }
