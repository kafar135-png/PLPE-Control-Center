import { useEffect, useMemo, useState } from "react";
import "./ArenaTrainingHub.css";
import TacticalBattle from "./TacticalBattle";
import { ARENA_TRAINING_OPPONENTS, arenaTrainingAvailable, arenaTrainingRemainingMs, formatTrainingCooldown, loadArenaTrainingState, markArenaTrainingWin } from "./ArenaTrainingSystem";
import { addTrainingXp, loadCharacterProgress } from "./CharacterProgression";
import { loadGameProgress } from "./Progress";
import { loadCurrentPveLoadout } from "./BattleLoadout";

interface ArenaTrainingHubProps {
  onBack: () => void;
  onReward?: (reward: { crowns: number; relics: number; xp: number }) => void;
}

export default function ArenaTrainingHub({ onBack, onReward }: ArenaTrainingHubProps) {
  const [trainingState, setTrainingState] = useState(loadArenaTrainingState);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const selected = useMemo(() => ARENA_TRAINING_OPPONENTS.find((o) => o.id === selectedId) ?? null, [selectedId]);

  if (selected) {
    const progress = loadCharacterProgress();
    const globalProgress = loadGameProgress();
    const pveLoadout = loadCurrentPveLoadout(globalProgress);
    return (
      <TacticalBattle
        title={`TRENING — ${selected.name}`}
        enemyGroupId={selected.enemyGroupId}
        enemyLevel={selected.enemyLevel}
        pepeLevel={progress.pepeLevel}
        bocianLevel={progress.bocianLevel}
        pepeClass={globalProgress.polishPepe.specialization}
        pepeBonuses={pveLoadout.pepeBonuses}
        bocianBonuses={pveLoadout.bocianBonuses}
        rewardText={[`+${selected.xpReward} XP`, `+${selected.crownsReward} Koron`, `Szansa na Relikt: ${Math.round(selected.relicChance * 100)}%`]}
        onVictory={() => {
          const next = markArenaTrainingWin(trainingState, selected.id);
          setTrainingState(next);
          addTrainingXp(loadCharacterProgress(), selected.xpReward, Math.round(selected.xpReward * 0.72));
          const relics = Math.random() < selected.relicChance ? 1 : 0;
          onReward?.({ crowns: selected.crownsReward, relics, xp: selected.xpReward });
          setSelectedId(null);
        }}
        onDefeat={() => setSelectedId(null)}
        onRetreat={() => setSelectedId(null)}
      />
    );
  }

  return (
    <section className="arena-training">
      <div className="arena-training__shade" />
      <header className="arena-training__header">
        <div>
          <small>KLASZTOR · ARENA TRENINGOWA</small>
          <h1>Trzy pojedynki treningowe</h1>
          <p>Każdego przeciwnika możesz pokonać raz na 12 godzin. Trening daje XP, Korony i szansę na Relikty.</p>
        </div>
        <button type="button" onClick={onBack}>WRÓĆ</button>
      </header>
      <div className="arena-training__grid">
        {ARENA_TRAINING_OPPONENTS.map((opponent, index) => {
          const remaining = arenaTrainingRemainingMs(trainingState, opponent.id, now);
          const ready = arenaTrainingAvailable(trainingState, opponent.id, now);
          return (
            <article key={opponent.id} className={`arena-training__opponent arena-training__opponent--${opponent.difficulty.toLowerCase()}`}>
              <div className="arena-training__number">0{index + 1}</div>
              <div className="arena-training__bear">🐻</div>
              <span className="arena-training__difficulty">{opponent.difficulty}</span>
              <h2>{opponent.name}</h2>
              <p>{opponent.subtitle}</p>
              <dl><div><dt>Poziom</dt><dd>{opponent.enemyLevel}</dd></div><div><dt>XP</dt><dd>+{opponent.xpReward}</dd></div><div><dt>Korony</dt><dd>+{opponent.crownsReward}</dd></div></dl>
              <button type="button" disabled={!ready} onClick={() => ready && setSelectedId(opponent.id)}>
                {ready ? "ROZPOCZNIJ TRENING" : `ODNOWIENIE ${formatTrainingCooldown(remaining)}`}
              </button>
            </article>
          );
        })}
      </div>
      <footer className="arena-training__footer"><span>WYGRANE TRENINGI</span><strong>{trainingState.totalWins}</strong><p>Cooldown jest zapisany lokalnie. Wylogowanie nie resetuje treningu.</p></footer>
    </section>
  );
}
