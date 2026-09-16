import { useMemo, useState } from "react";
import "./LocationActivityPanel.css";
import type { LocationMiniActivity } from "./LocationActivitySystem";

interface Props{activity:LocationMiniActivity;onComplete:()=>void;onClose:()=>void;}

export default function LocationActivityPanel({activity,onComplete,onClose}:Props){
  const sequence=useMemo(()=>Array.from({length:4},()=>Math.floor(Math.random()*4)),[activity.id]);
  const [input,setInput]=useState<number[]>([]);
  const [step,setStep]=useState(0);
  const [ttt,setTtt]=useState<(null|"X"|"O")[]>(Array(9).fill(null));
  const [hunt,setHunt]=useState<Set<number>>(new Set());
  const [message,setMessage]=useState(activity.description);

  function success(){setMessage(`UKOŃCZONE — ${activity.rewardText}`);window.setTimeout(onComplete,650);}
  function pressRune(i:number){
    const next=[...input,i]; setInput(next);
    if(next[next.length-1]!==sequence[next.length-1]){setInput([]);setMessage("Błąd. Sekwencja resetuje się.");return;}
    if(next.length===sequence.length)success();
  }
  function tttClick(i:number){
    if(ttt[i])return; const next=[...ttt]; next[i]="X";
    const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    if(lines.some(c=>c.every(x=>next[x]==="X"))){setTtt(next);success();return;}
    const empty=next.map((v,idx)=>v?null:idx).filter(v=>v!==null) as number[];
    if(empty.length){next[empty[Math.floor(Math.random()*empty.length)]]="O";} setTtt(next);
  }

  return <section className="location-activity"><div className="location-activity__box">
    <header><div><small>AKTYWNOŚĆ LOKACJI</small><h2>{activity.title}</h2><p>{message}</p></div><button onClick={onClose}>×</button></header>
    {(activity.type==="runes"||activity.type==="memory")&&<div>
      <div className="location-activity__sequence">{sequence.map((n,i)=><span key={i}>{activity.type==="memory"&&step===0?"?":["◆","●","▲","✦"][n]}</span>)}</div>
      {activity.type==="memory"&&step===0?<button className="location-activity__start" onClick={()=>setStep(1)}>POKAŻ SEKWENCJĘ</button>:null}
      {activity.type==="memory"&&step===1?<button className="location-activity__start" onClick={()=>setStep(2)}>ZAPAMIĘTANE</button>:null}
      {(activity.type==="runes"||step===2)&&<div className="location-activity__buttons">{[0,1,2,3].map(i=><button key={i} onClick={()=>pressRune(i)}>{["◆","●","▲","✦"][i]}</button>)}</div>}
    </div>}
    {activity.type==="relic-hunt"&&<div className="location-activity__hunt">{Array.from({length:9},(_,i)=><button key={i} className={hunt.has(i)?"found":""} onClick={()=>{const next=new Set(hunt);if(i%3===1)next.add(i);setHunt(next);if(next.size>=3)success();}}>{hunt.has(i)?"✦":"?"}</button>)}</div>}
    {activity.type==="tictactoe"&&<div className="location-activity__ttt">{ttt.map((v,i)=><button key={i} onClick={()=>tttClick(i)}>{v}</button>)}</div>}
    <footer>NAGRODA: <strong>{activity.rewardText}</strong></footer>
  </div></section>
}
