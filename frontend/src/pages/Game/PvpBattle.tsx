import { useCallback, useEffect, useMemo, useState } from "react";
import "./PvpBattle.css";
import arenaBg from "../../assets/game/battle_bg_arena.png";
import warriorArt from "../../assets/game/char_polishpepe_warrior.png";
import rangerArt from "../../assets/game/char_polishpepe_ranger.png";
import mageArt from "../../assets/game/char_polishpepe_mage.png";
import { PEPE_CLASSES } from "./CharacterClasses";
import { getGameMatch, sendGamePresenceHeartbeat, submitGameMatchAction, type GameMatchLobby, type GamePvpCombatant } from "../../services/gameMultiplayer";

interface Props { matchId: string; myWallet: string; onExit: () => void; }

function pct(unit?: GamePvpCombatant) { return unit ? Math.max(0, Math.min(100, Math.round(unit.hp / Math.max(1, unit.maxHp) * 100))) : 0; }

export default function PvpBattle({ matchId, myWallet, onExit }: Props) {
  const [match, setMatch] = useState<GameMatchLobby | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => { try { setMatch(await getGameMatch(matchId)); setError(""); } catch (cause) { setError(cause instanceof Error ? cause.message : "PvP sync error"); } }, [matchId]);

  useEffect(() => { void sendGamePresenceHeartbeat("in_battle"); void refresh(); const timer = window.setInterval(() => void refresh(), 900); return () => window.clearInterval(timer); }, [refresh]);
  const state = match?.battleState ?? null;
  const me = state?.players[myWallet.toLowerCase()] ?? state?.players[myWallet] ?? null;
  const enemy = useMemo(() => state ? Object.values(state.players).find(player => player.wallet.toLowerCase() !== myWallet.toLowerCase()) ?? null : null, [state, myWallet]);
  const myTurn = Boolean(match?.status === "active" && state && state.turnWallet.toLowerCase() === myWallet.toLowerCase());

  async function act(type: "attack" | "skill" | "spirit" | "defend") {
    if (!match || !myTurn || busy) return;
    setBusy(true); setError("");
    try { setMatch(await submitGameMatchAction(match.id, type, match.turnVersion ?? 0)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "PvP action failed"); await refresh(); }
    finally { setBusy(false); }
  }

  if (!match || !state || !me || !enemy) return <main className="pvp-battle" style={{backgroundImage:`url(${arenaBg})`}}><div className="pvp-battle__loading">{error || "Synchronizacja pojedynku..."}</div></main>;
  const classArt = { warrior: warriorArt, ranger: rangerArt, mage: mageArt } as const;
  const myClass = PEPE_CLASSES[me.specialization];
  const enemyClass = PEPE_CLASSES[enemy.specialization];
  const completed = match.status === "completed";
  const won = completed && match.winnerWallet?.toLowerCase() === myWallet.toLowerCase();

  return <main className="pvp-battle" style={{backgroundImage:`linear-gradient(rgba(3,7,10,.25),rgba(3,7,10,.55)),url(${arenaBg})`}}>
    <header className="pvp-battle__header"><div><small>PLPE ARENA · RANKED PVP</small><h1>{me.nickname} vs {enemy.nickname}</h1></div><div className="pvp-battle__round"><span>RUNDA</span><b>{state.round}</b></div><div className={`pvp-battle__turn ${myTurn ? "mine" : "enemy"}`}>{completed ? "KONIEC" : myTurn ? "TWÓJ RUCH" : "RUCH RYWALA"}</div></header>
    {error && <div className="pvp-battle__error">{error}</div>}
    <section className="pvp-battle__field">
      <article className={`pvp-fighter mine ${myTurn ? "active" : ""}`}>
        <div className="pvp-fighter__info"><strong>{me.nickname}</strong><span>{myClass.icon} {myClass.namePl} · LV {me.level}</span><div className="pvp-hp"><i style={{width:`${pct(me)}%`}}/></div><small>{me.hp}/{me.maxHp} HP · ⚔ {me.attack} · 🛡 {me.defense} · ⚡ {me.speed}</small></div>
        <div className="pvp-fighter__portrait"><img src={classArt[me.specialization]} alt={me.nickname}/><b>{myClass.icon}</b>{me.shield>0&&<em>🛡 {me.shield}</em>}</div>
      </article>
      <div className="pvp-battle__vs">VS</div>
      <article className={`pvp-fighter enemy ${!myTurn && !completed ? "active" : ""}`}>
        <div className="pvp-fighter__info"><strong>{enemy.nickname}</strong><span>{enemyClass.icon} {enemyClass.namePl} · LV {enemy.level}</span><div className="pvp-hp"><i style={{width:`${pct(enemy)}%`}}/></div><small>{enemy.hp}/{enemy.maxHp} HP · ⚔ {enemy.attack} · 🛡 {enemy.defense} · ⚡ {enemy.speed}</small></div>
        <div className="pvp-fighter__portrait"><img src={classArt[enemy.specialization]} alt={enemy.nickname}/><b>{enemyClass.icon}</b>{enemy.shield>0&&<em>🛡 {enemy.shield}</em>}</div>
      </article>
    </section>
    {completed ? <section className={`pvp-result ${won ? "win" : "loss"}`}><h2>{won ? "ZWYCIĘSTWO" : "PORAŻKA"}</h2><p>{won ? `+${match.ratingDelta ?? 0} rating` : `-${match.ratingDelta ?? 0} rating`}</p><button onClick={async()=>{await sendGamePresenceHeartbeat("online");onExit();}}>WRÓĆ DO ARENY</button></section> : <footer className="pvp-actions"><div><span>PLPE SPIRIT</span><b>{me.spirit}%</b></div><button disabled={!myTurn||busy} onClick={()=>void act("attack")}>⚔️ ATAK</button><button disabled={!myTurn||busy||me.level<2||me.skillCooldown>0} onClick={()=>void act("skill")}>{myClass.skills[1]?.icon ?? "✨"} {myClass.skills[1]?.namePl ?? "SKILL"}{me.skillCooldown>0?` · CD ${me.skillCooldown}`:""}</button><button disabled={!myTurn||busy||me.level<4||me.spirit<100} onClick={()=>void act("spirit")}>⚡ SPIRIT</button><button disabled={!myTurn||busy} onClick={()=>void act("defend")}>🛡️ OBRONA</button></footer>}
    <aside className="pvp-log"><h3>DZIENNIK WALKI</h3>{[...state.log].reverse().slice(0,6).map((entry,i)=><p key={`${entry.at}-${i}`}>{entry.text}</p>)}</aside>
  </main>;
}
