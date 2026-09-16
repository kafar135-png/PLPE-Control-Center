import { useMemo, useState } from "react";
import TacticalBattle from "./TacticalBattle";
import { awardGlobalReward, loadGameProgress, type GameReward } from "./Progress";
import { loadCurrentPveLoadout } from "./BattleLoadout";

interface BonusZone {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  enemyGroupId: string;
  enemyLevel: number;
  reward: GameReward;
  cooldownHours: number;
}

const KEY = "plpe-bonus-zones-v1";

const ZONES: BonusZone[] = [
  {
    id: "relic-cavern",
    name: "Jaskinia Reliktów",
    subtitle: "Stare tunele pod górami. Mało informacji, dużo reliktów i nieproszonych strażników.",
    icon: "💎",
    enemyGroupId: "bear-heavy-patrol",
    enemyLevel: 2,
    reward: { xp: 120, bocianXp: 80, relics: 4, crowns: 120, memeEnergy: 90 },
    cooldownHours: 12,
  },
  {
    id: "lost-caravan",
    name: "Zaginiona Karawana",
    subtitle: "Odbij transport PLPEków i materiałów zanim niedźwiedzie wywiozą go do Ciemnej Doliny.",
    icon: "🪙",
    enemyGroupId: "bear-elite",
    enemyLevel: 2,
    reward: { xp: 140, bocianXp: 90, crowns: 260, memeEnergy: 120, cardFragments: 2 },
    cooldownHours: 12,
  },
  {
    id: "storm-altar",
    name: "Ołtarz Burzy",
    subtitle: "Magiczna plansza wysokiego ryzyka. Najlepsze źródło Intel i fragmentów komiksu.",
    icon: "⚡",
    enemyGroupId: "ancient-serpent-pack",
    enemyLevel: 3,
    reward: { xp: 180, bocianXp: 120, relics: 2, intel: 3, comicFragments: 2, crowns: 180 },
    cooldownHours: 18,
  },
];

function loadCooldowns(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}

function rewardText(reward: GameReward) {
  const parts: string[] = [];
  if (reward.xp) parts.push(`+${reward.xp} XP`);
  if (reward.relics) parts.push(`+${reward.relics} Relikty`);
  if (reward.crowns) parts.push(`+${reward.crowns} PLPEków`);
  if (reward.intel) parts.push(`+${reward.intel} Intel`);
  if (reward.cardFragments) parts.push(`+${reward.cardFragments} Fragmenty kart`);
  if (reward.comicFragments) parts.push(`+${reward.comicFragments} Fragmenty komiksu`);
  return parts;
}

export default function BonusZones() {
  const [selected, setSelected] = useState<BonusZone | null>(null);
  const [cooldowns, setCooldowns] = useState(loadCooldowns);
  const progress = loadGameProgress();
  const pveLoadout = loadCurrentPveLoadout(progress);
  const now = Date.now();
  const cards = useMemo(() => ZONES.map(zone => {
    const readyAt = cooldowns[zone.id] || 0;
    const remaining = Math.max(0, readyAt - now);
    return { zone, remaining, ready: remaining <= 0 };
  }), [cooldowns, now]);

  if (selected) {
    return <div className="bonus-zone-battle"><TacticalBattle
      title={`BONUS — ${selected.name}`}
      enemyGroupId={selected.enemyGroupId}
      enemyLevel={selected.enemyLevel}
      pepeLevel={progress.polishPepe.level}
      bocianLevel={progress.bocian.rank}
      pepeClass={progress.polishPepe.specialization}
      pepeBonuses={pveLoadout.pepeBonuses}
      bocianBonuses={pveLoadout.bocianBonuses}
      rewardText={rewardText(selected.reward)}
      onVictory={() => {
        awardGlobalReward(selected.reward);
        const next = { ...cooldowns, [selected.id]: Date.now() + selected.cooldownHours * 60 * 60 * 1000 };
        localStorage.setItem(KEY, JSON.stringify(next));
        setCooldowns(next);
        setSelected(null);
      }}
      onDefeat={() => setSelected(null)}
      onRetreat={() => setSelected(null)}
    /></div>;
  }

  return <section className="building-panel bonus-zones">
    <div className="bonus-zones__head"><div><span>BONUSOWE PLANSZE</span><h2>Strefy łupu</h2></div><p>Trzy dodatkowe wyzwania do zdobywania Reliktów, PLPEków, Intel i fragmentów. Każda ma osobny cooldown.</p></div>
    <div className="building-hub__grid">
      {cards.map(({ zone, ready, remaining }) => {
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.ceil((remaining % 3600000) / 60000);
        return <article key={zone.id} className={`building-card ${ready ? "ready" : "locked"}`}>
          <div className="building-card__icon">{zone.icon}</div>
          <h3>{zone.name}</h3>
          <p>{zone.subtitle}</p>
          <div className="building-cost"><strong>NAGRODA:</strong> {rewardText(zone.reward).join(" · ")}</div>
          <button className="building-action" disabled={!ready} onClick={() => ready && setSelected(zone)}>
            {ready ? "WEJDŹ NA PLANSZĘ" : `ODNOWIENIE ${hours}h ${minutes}m`}
          </button>
        </article>;
      })}
    </div>
  </section>;
}
