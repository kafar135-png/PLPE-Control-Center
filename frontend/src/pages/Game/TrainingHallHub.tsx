import { useState } from "react";
import "./BuildingHubShared.css";
import trainingBg from "../../assets/game/training_hall_hub_bg.png";
import { getMonasteryRankCap, useGameProgress } from "./Progress";
import { PEPE_CLASSES } from "./CharacterClasses";

type Stat = "hp" | "attack" | "defense" | "speed";
interface Props { level:number; xp:number; xpRequired:number; hp:number; attack:number; defense:number; speed:number; skillPoints:number; onUpgradeStat:(stat:Stat)=>void; onBack:()=>void; }
type Hero="pepe"|"bocian";
export default function TrainingHallHub({onBack}:Props){
 const {progress,upgradePepeStat,upgradeBocianStat}=useGameProgress();
 const [hero,setHero]=useState<Hero>("pepe");
 const pepe=progress.polishPepe; const bocian=progress.bocian;
 const bocianRankCap=getMonasteryRankCap(progress.monastery.level);
 const pct=hero==="pepe"?Math.min(100,pepe.xp/Math.max(1,pepe.xpRequired)*100):Math.min(100,bocian.xp/Math.max(1,bocian.xpRequired)*100);
 const pepeClass = PEPE_CLASSES[pepe.specialization ?? "warrior"];
 const trainingAdvice = pepe.specialization === "ranger"
  ? "Rekomendacja: ATK + SPD. HP jest rozsądnym trzecim wyborem, jeśli giniesz zbyt szybko."
  : pepe.specialization === "mage"
    ? "Rekomendacja: ATK + SPD, następnie HP. Mag wygrywa kontrolą i penetracją, nie ciężkim pancerzem."
    : "Rekomendacja: DEF + HP, następnie ATK. Wojownik ma przetrwać presję i wygrać długą wymianę.";
 const skills=hero==="pepe"?pepeClass.skills.map(skill => [skill.icon, skill.namePl, skill.descPl, skill.level]):[
  ["❄️","Freeze","Zamraża jeden cel i pomija jego następną turę.",1],
  ["💤","Sleep","Usypia przeciwnika. Trafienie może go obudzić.",2],
  ["✨","Blessing","Wzmacnia ATK/DEF Pepe na 2 tury.",2],
  ["⚡","Stork Bolt","Magiczny atak Bociana.",1],
  ["🛡️","Guardian Wing","Bocian osłania Pepe i zmniejsza obrażenia.",3]
 ];
 return <main className="building-hub" style={{backgroundImage:`url(${trainingBg})`}}>
  <header className="building-hub__top"><div><div className="building-hub__eyebrow">SALA TRENINGOWA · BUDYNEK LV {progress.buildings.trainingHall}</div><h1 className="building-hub__title">Rozwój bohaterów</h1></div><button className="building-hub__back" onClick={onBack}>← WRÓĆ DO HUBU</button></header>
  <section className="building-hub__content">
   <div className="building-tabs"><button className={`building-tab ${hero==='pepe'?'active':''}`} onClick={()=>setHero('pepe')}>🐸 POLISHPEPE</button><button className={`building-tab ${hero==='bocian'?'active':''}`} onClick={()=>setHero('bocian')}>🪽 BOCIAN</button></div>
   <div className="building-hub__hero"><div className="building-hub__eyebrow">{hero==='pepe'?`POZIOM ${pepe.level} · ${pepeClass.icon} ${pepeClass.namePl.toUpperCase()}`:`RANGA ${bocian.rank} / ${bocianRankCap}`}</div><h2>{hero==='pepe'?pepe.xp:bocian.xp} / {hero==='pepe'?pepe.xpRequired:bocian.xpRequired} XP</h2><div className="building-progress"><i style={{width:`${pct}%`}}/></div><p>Tu wydajesz punkty rozwoju zdobyte za walki, treningi Areny, misje i eksplorację. Arena bojowa jest osobnym budynkiem — tutaj nie dublujemy pojedynków.</p>{hero==="pepe"&&<p><b>{trainingAdvice}</b></p>}{hero==="bocian"&&<p><b>{bocian.rank>=bocianRankCap?`Limit rangi Klasztoru: ${bocianRankCap}. Nadmiar pełnych pasków XP zamienia się w punkty treningowe — XP nie przepada.`:`Do limitu Klasztoru pozostało rang: ${bocianRankCap-bocian.rank}.`}</b></p>}</div>
   {hero==='pepe'?<div className="building-hub__grid">
    {([['hp','❤️','ŻYCIE',pepe.hp,'+10 HP'],['attack','⚔️','ATAK',pepe.attack,'+2 ATK'],['defense','🛡️','OBRONA',pepe.defense,'+2 DEF'],['speed','⚡','SZYBKOŚĆ',pepe.speed,'+2 SPD']] as [Stat,string,string,number,string][]).map(([key,icon,name,value,bonus])=><article className={`building-card ${pepe.skillPoints>0?'ready':''}`} key={key}><div className="building-card__icon">{icon}</div><h3>{name}</h3><p>Aktualnie <b>{value}</b>. Rozwój: {bonus}.</p><div className="building-card__meta"><span className="building-chip">Punkty: {pepe.skillPoints}</span></div><button className="building-action" disabled={pepe.skillPoints<=0} onClick={()=>upgradePepeStat(key)}>{pepe.skillPoints>0?'TRENUJ':'BRAK PUNKTÓW'}</button></article>)}
   </div>:<div className="building-hub__grid">
    {([['hp','❤️','ŻYCIE',bocian.hp,'+10 HP'],['magic','✨','MAGIA',bocian.magic,'+2 MAG'],['defense','🛡️','OBRONA',bocian.defense,'+2 DEF'],['speed','⚡','SZYBKOŚĆ',bocian.speed,'+2 SPD']] as const).map(([key,icon,name,value,bonus])=><article className={`building-card ${bocian.skillPoints>0?'ready':''}`} key={key}><div className="building-card__icon">{icon}</div><h3>{name}</h3><p>Aktualnie <b>{value}</b>. Rozwój: {bonus}.</p><div className="building-card__meta"><span className="building-chip">Punkty: {bocian.skillPoints}</span></div><button className="building-action" disabled={bocian.skillPoints<=0} onClick={()=>upgradeBocianStat(key)}>{bocian.skillPoints>0?'TRENUJ BOCIANA':'BRAK PUNKTÓW'}</button></article>)}
   </div>}
   <div className="building-panel"><h2>Umiejętności — {hero==='pepe'?`PolishPepe · ${pepeClass.namePl}`:'Bocian'}</h2><div className="building-hub__grid">{skills.map(([icon,name,desc,need])=>{const lv=hero==='pepe'?pepe.level:bocian.rank;return <article className={`building-card ${lv>=Number(need)?'ready':'locked'}`} key={String(name)}><div className="building-card__icon">{icon}</div><h3>{name}</h3><p>{desc}</p><span className="building-chip">Wymagany {hero==='pepe'?'LV':'RANGA'} {need}</span></article>})}</div></div>
  </section>
 </main>
}
