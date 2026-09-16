import { useEffect, useMemo, useState } from "react";
import "./WorldMapSideMission.css";

export interface SideMissionReward {
  memeEnergy?: number;
  relics?: number;
  intel?: number;
  bearFragments?: number;
  comicFragments?: number;
  cardFragments?: number;
}

export type SideMissionKind = "difference" | "sequence" | "reaction" | "logic";

export interface SideMissionDefinition {
  id: string;
  locationId: string;
  anchorId: string;
  title: string;
  subtitle: string;
  kind: SideMissionKind;
  reward: SideMissionReward;
  rewardText: string;
}

export const SIDE_MISSIONS: SideMissionDefinition[] = [
  { id: "cliff-signal", locationId: "monastery-cliffs", anchorId: "lower-road", title: "Sygnał na klifie", subtitle: "Porównaj znaki zwiadowców i znajdź fałszywy symbol.", kind: "difference", reward: { memeEnergy: 20, intel: 1 }, rewardText: "+20 Energy • +1 Intel" },
  { id: "eagle-wind", locationId: "eagle-ledge", anchorId: "forest-pass", title: "Próba Wiatru", subtitle: "Zatrzymaj znacznik w zielonej strefie na skalnej grani.", kind: "reaction", reward: { memeEnergy: 25 }, rewardText: "+25 Energy" },
  { id: "broken-cart-code", locationId: "broken-cart", anchorId: "forest-pass", title: "Skrzynia z karawany", subtitle: "Zapamiętaj kolejność znaków i otwórz zamek skrzyni.", kind: "sequence", reward: { memeEnergy: 10, cardFragments: 1 }, rewardText: "+10 Energy • +1 Card Fragment" },
  { id: "pine-runes", locationId: "pine-clearing", anchorId: "forest-camp", title: "Runy Polany", subtitle: "Ustaw kamienie tak, aby wszystkie runy zapłonęły.", kind: "logic", reward: { relics: 1, memeEnergy: 15 }, rewardText: "+1 Relikt • +15 Energy" },
  { id: "shrine-runes", locationId: "forest-shrine", anchorId: "mist-lake", title: "Pieczęć Leśnej Kaplicy", subtitle: "Odtwórz sekwencję starożytnych symboli.", kind: "sequence", reward: { relics: 1, intel: 1 }, rewardText: "+1 Relikt • +1 Intel" },
  { id: "hidden-cave-lock", locationId: "hidden-cave", anchorId: "waterfall-path", title: "Zamek Ukrytej Jaskini", subtitle: "Znajdź różnicę między dwiema płytami skalnymi.", kind: "difference", reward: { relics: 1, cardFragments: 1 }, rewardText: "+1 Relikt • +1 Card Fragment" },
  { id: "fog-lanterns", locationId: "fog-marsh", anchorId: "old-quarry", title: "Latarnie we mgle", subtitle: "Złap właściwy moment, zanim światło zniknie w mgle.", kind: "reaction", reward: { memeEnergy: 25, intel: 1 }, rewardText: "+25 Energy • +1 Intel" },
  { id: "deep-mine-runes", locationId: "deep-mine", anchorId: "mine-entrance", title: "Mechanizm Głębokiej Kopalni", subtitle: "Przełącz kamienne płytki i uruchom stary mechanizm.", kind: "logic", reward: { relics: 2 }, rewardText: "+2 Relikty" },
  { id: "graveyard-symbols", locationId: "graveyard", anchorId: "stone-circle", title: "Znaki na nagrobkach", subtitle: "Wskaż symbol, który nie pasuje do pozostałych.", kind: "difference", reward: { comicFragments: 1, intel: 1 }, rewardText: "+1 Comic Fragment • +1 Intel" },
  { id: "cellar-code", locationId: "watchtower-cellar", anchorId: "watchtower", title: "Kod Strażnicy", subtitle: "Zapamiętaj wojskowy szyfr i wpisz go bez pomyłki.", kind: "sequence", reward: { intel: 2 }, rewardText: "+2 Intel" },
  { id: "village-cache", locationId: "village-cellar", anchorId: "abandoned-village", title: "Skrytka pod wioską", subtitle: "Ustaw cztery mechanizmy starego sejfu.", kind: "logic", reward: { bearFragments: 2, memeEnergy: 20 }, rewardText: "+2 Bear Fragments • +20 Energy" },
  { id: "dark-watch-sigil", locationId: "dark-watch", anchorId: "ash-pits", title: "Pieczęć Ciemnej Strażnicy", subtitle: "Rozpoznaj fałszywy znak Bear Army przed alarmem.", kind: "difference", reward: { intel: 2, cardFragments: 1 }, rewardText: "+2 Intel • +1 Card Fragment" },
];

export function sideMissionForLocation(locationId: string) {
  return SIDE_MISSIONS.find((mission) => mission.locationId === locationId) ?? null;
}

interface Props {
  missionId: string;
  onClose: () => void;
  onComplete: (missionId: string) => void;
}

const RUNES = ["◆", "✦", "▲", "●"];

export default function WorldMapSideMission({ missionId, onClose, onComplete }: Props) {
  const mission = SIDE_MISSIONS.find((entry) => entry.id === missionId);
  const [attempt, setAttempt] = useState(0);
  const [message, setMessage] = useState("Gotowy?");

  if (!mission) return null;

  return (
    <div className="side-mission-overlay" role="dialog" aria-modal="true">
      <section className="side-mission-modal">
        <header>
          <div>
            <span>ZADANIE POBOCZNE</span>
            <h2>{mission.title}</h2>
            <p>{mission.subtitle}</p>
          </div>
          <button type="button" onClick={onClose}>×</button>
        </header>

        <div className="side-mission-reward">NAGRODA <strong>{mission.rewardText}</strong></div>

        <div className="side-mission-game">
          {mission.kind === "difference" && (
            <DifferenceGame key={`${mission.id}-${attempt}`} onWin={() => onComplete(mission.id)} onFail={() => { setMessage("Nie ten znak. Spróbuj jeszcze raz."); setAttempt((value) => value + 1); }} />
          )}
          {mission.kind === "sequence" && (
            <SequenceGame key={`${mission.id}-${attempt}`} onWin={() => onComplete(mission.id)} onFail={() => { setMessage("Zła kolejność. Sekwencja zmienia się."); setAttempt((value) => value + 1); }} />
          )}
          {mission.kind === "reaction" && (
            <ReactionGame key={`${mission.id}-${attempt}`} onWin={() => onComplete(mission.id)} onFail={() => { setMessage("Za wcześnie albo za późno. Jeszcze raz."); setAttempt((value) => value + 1); }} />
          )}
          {mission.kind === "logic" && (
            <LogicGame key={`${mission.id}-${attempt}`} onWin={() => onComplete(mission.id)} />
          )}
        </div>

        <footer><span>{message}</span><button type="button" onClick={onClose}>WRÓĆ NA MAPĘ</button></footer>
      </section>
    </div>
  );
}

function DifferenceGame({ onWin, onFail }: { onWin: () => void; onFail: () => void }) {
  const data = useMemo(() => {
    const base = Array.from({ length: 9 }, (_, index) => RUNES[index % RUNES.length]);
    const differentIndex = Math.floor(Math.random() * 9);
    const altered = [...base];
    altered[differentIndex] = RUNES[(RUNES.indexOf(base[differentIndex]) + 1) % RUNES.length];
    return { base, altered, differentIndex };
  }, []);

  return (
    <div className="difference-game">
      <div><b>WZORZEC</b><div className="rune-grid static">{data.base.map((rune, index) => <span key={index}>{rune}</span>)}</div></div>
      <div><b>ZNAJDŹ RÓŻNICĘ</b><div className="rune-grid">{data.altered.map((rune, index) => <button type="button" key={index} onClick={() => index === data.differentIndex ? onWin() : onFail()}>{rune}</button>)}</div></div>
    </div>
  );
}

function SequenceGame({ onWin, onFail }: { onWin: () => void; onFail: () => void }) {
  const sequence = useMemo(() => Array.from({ length: 5 }, () => RUNES[Math.floor(Math.random() * RUNES.length)]), []);
  const [show, setShow] = useState(true);
  const [input, setInput] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShow(false), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  function choose(rune: string) {
    if (show) return;
    const next = [...input, rune];
    setInput(next);
    const index = next.length - 1;
    if (next[index] !== sequence[index]) {
      onFail();
      return;
    }
    if (next.length === sequence.length) onWin();
  }

  return (
    <div className="sequence-game">
      <div className={`sequence-preview ${show ? "visible" : "hidden"}`}>{sequence.map((rune, index) => <span key={index}>{show ? rune : "?"}</span>)}</div>
      <small>{show ? "Zapamiętaj kolejność..." : `Wpisano ${input.length}/${sequence.length}`}</small>
      <div className="rune-buttons">{RUNES.map((rune) => <button type="button" key={rune} disabled={show} onClick={() => choose(rune)}>{rune}</button>)}</div>
    </div>
  );
}

function ReactionGame({ onWin, onFail }: { onWin: () => void; onFail: () => void }) {
  const [position, setPosition] = useState(4);
  const [direction, setDirection] = useState(1);
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    if (stopped) return;
    const timer = window.setInterval(() => {
      setPosition((current) => {
        let next = current + direction * 2.5;
        if (next >= 98) { next = 98; setDirection(-1); }
        if (next <= 2) { next = 2; setDirection(1); }
        return next;
      });
    }, 24);
    return () => window.clearInterval(timer);
  }, [direction, stopped]);

  function stop() {
    setStopped(true);
    if (position >= 43 && position <= 57) onWin();
    else window.setTimeout(onFail, 350);
  }

  return (
    <div className="reaction-game">
      <div className="reaction-track"><i className="reaction-target" /><span style={{ left: `${position}%` }} /></div>
      <small>Zatrzymaj znacznik w zielonej strefie.</small>
      <button type="button" disabled={stopped} onClick={stop}>ZATRZYMAJ</button>
    </div>
  );
}

function LogicGame({ onWin }: { onWin: () => void }) {
  const [cells, setCells] = useState([false, true, false, true, false, true]);
  const solved = cells.every(Boolean);

  useEffect(() => {
    if (!solved) return;
    const timer = window.setTimeout(onWin, 350);
    return () => window.clearTimeout(timer);
  }, [onWin, solved]);

  function toggle(index: number) {
    setCells((current) => current.map((value, cellIndex) => {
      if (cellIndex === index || cellIndex === index - 1 || cellIndex === index + 1) return !value;
      return value;
    }));
  }

  return (
    <div className="logic-game">
      <p>Cel: zapal wszystkie sześć run. Każdy przycisk zmienia także sąsiednie runy.</p>
      <div>{cells.map((active, index) => <button type="button" key={index} className={active ? "active" : ""} onClick={() => toggle(index)}>{active ? "✦" : "◇"}</button>)}</div>
      <small>{solved ? "Mechanizm odblokowany." : "Szukaj właściwej kombinacji."}</small>
    </div>
  );
}
