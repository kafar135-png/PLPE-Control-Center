import { useEffect, useRef, useState } from "react";
import type { CampaignPuzzleKind } from "./CampaignMapData";
import { seededRandom, shuffle } from "./CampaignMapEngine";
import CampaignMapIcon from "./CampaignMapIcons";

interface PuzzleProps { kind: CampaignPuzzleKind; seed: number; title: string; onComplete: () => void; onClose: () => void; }
const MARKET_SIGNS = [
  { symbol: "₿", label: "Bitcoin" },
  { symbol: "Ξ", label: "Ethereum" },
  { symbol: "🐸", label: "PLPE" },
  { symbol: "Au", label: "Gold" },
  { symbol: "Ag", label: "Silver" },
  { symbol: "₮", label: "USDT" },
  { symbol: "🛢", label: "Oil" },
  { symbol: "📈", label: "Index" },
];
const SIGNS = MARKET_SIGNS.map((item) => item.symbol);
export const PUZZLE_LABELS: Record<CampaignPuzzleKind, string> = {
  compare: "Porównywanie znaków", memory: "Pary pieczęci", sequence: "Sekwencja sygnałów",
  lights: "Obwód run", timing: "Mechanizm zręcznościowy", slide: "Kamienna układanka",
};
export default function CampaignMissionPuzzle({ kind, seed, title, onComplete, onClose }: PuzzleProps) {
  const [won, setWon] = useState(false);
  const wonRef = useRef(false);
  function win() { if (!wonRef.current) { wonRef.current = true; setWon(true); } }
  useEffect(() => { const old = document.activeElement; return () => { if (old instanceof HTMLElement && old.isConnected) old.focus(); }; }, []);
  return <div className="cm-overlay" role="dialog" aria-modal="true" aria-label={title}>
    <section className="cm-puzzle" data-puzzle-kind={kind}>
      <header className="cm-panel-head"><div><small>{PUZZLE_LABELS[kind]}</small><h2>{title}</h2></div>
        <button type="button" className="cm-icon-button" onClick={onClose} aria-label="Opuść zadanie"><CampaignMapIcon kind="close"/></button></header>
      {won ? <div className="cm-puzzle-win"><CampaignMapIcon kind="spark"/><h3>Zadanie wykonane</h3><p>Odbierz nagrodę, aby zapisać ukończenie etapu.</p><button type="button" className="cm-primary" onClick={onComplete} autoFocus>Zapisz etap i odbierz nagrodę</button></div> : <>
        {kind === "compare" && <ComparePuzzle seed={seed} onWin={win}/>}
        {kind === "memory" && <MemoryPuzzle seed={seed} onWin={win}/>}
        {kind === "sequence" && <SequencePuzzle seed={seed} onWin={win}/>}
        {kind === "lights" && <LightsPuzzle seed={seed} onWin={win}/>}
        {kind === "timing" && <TimingPuzzle seed={seed} onWin={win}/>}
        {kind === "slide" && <SlidePuzzle seed={seed} onWin={win}/>}
      </>}
    </section>
  </div>;
}
interface GameProps { seed: number; onWin: () => void; }
function ComparePuzzle({ seed, onWin }: GameProps) {
  const [data] = useState(() => {
    const rng = seededRandom(seed), left = Array.from({ length: 16 }, () => Math.floor(rng() * SIGNS.length));
    const changes = shuffle(Array.from({ length: 16 }, (_, i) => i), seed + 1).slice(0, 3);
    return { left, right: left.map((n, i) => changes.includes(i) ? (n + 1 + i % 5) % SIGNS.length : n), changes };
  });
  const [found, setFound] = useState<number[]>([]), [wrong, setWrong] = useState<number | null>(null);
  function pick(i: number) {
    if (found.includes(i)) return;
    if (!data.changes.includes(i)) { setWrong(i); return; }
    const next = [...found, i]; setFound(next); setWrong(null); if (next.length === data.changes.length) onWin();
  }
  return <div className="cm-puzzle-body"><p>Porównaj dwie tablice. Wskaż <b>3 różniące się symbole na prawej tablicy</b>.</p>
    <div className="cm-comparison"><div><h3>Wzór</h3><div className="cm-runes cm-runes--four">{data.left.map((n, i) => <span key={i}>{SIGNS[n]}</span>)}</div></div>
      <div><h3>Tablica do sprawdzenia</h3><div className="cm-runes cm-runes--four">{data.right.map((n, i) => <button type="button" key={i} className={found.includes(i) ? "good" : wrong === i ? "bad" : ""} onClick={() => pick(i)} aria-label={`Sprawdź symbol ${i + 1}`}>{SIGNS[n]}</button>)}</div></div></div>
    <p className="cm-puzzle-feedback" role="status">Odnalezione różnice: {found.length}/3. {wrong !== null ? "Ten symbol pasuje do wzoru. Szukaj dalej." : ""}</p></div>;
}
function MemoryPuzzle({ seed, onWin }: GameProps) {
  const [cards] = useState(() => shuffle(Array.from({ length: 12 }, (_, i) => i % 6), seed));
  const [open, setOpen] = useState<number[]>([]), [matched, setMatched] = useState<number[]>([]), [tries, setTries] = useState(0);
  const callback = useRef(onWin); callback.current = onWin;
  useEffect(() => {
    if (open.length !== 2) return;
    const [a, b] = open, match = cards[a] === cards[b];
    const timer = window.setTimeout(() => {
      if (match) { const next = [...matched, a, b]; setMatched(next); if (next.length === cards.length) callback.current(); }
      setOpen([]);
    }, match ? 280 : 850);
    return () => window.clearTimeout(timer);
  }, [open, cards, matched]);
  function pick(i: number) { if (open.length >= 2 || open.includes(i) || matched.includes(i)) return; if (open.length === 1) setTries(t => t + 1); setOpen([...open, i]); }
  return <div className="cm-puzzle-body"><p>Odkrywaj po dwie pieczęcie i znajdź <b>6 par</b>. Niedopasowane pieczęcie zakrywają się ponownie.</p>
    <div className="cm-runes cm-runes--four cm-memory">{cards.map((n, i) => <button type="button" key={i} disabled={matched.includes(i)} className={matched.includes(i) ? "good" : open.includes(i) ? "lit" : ""} onClick={() => pick(i)} aria-label={`Pieczęć ${i + 1}`}>{open.includes(i) || matched.includes(i) ? SIGNS[n] : "?"}</button>)}</div>
    <p role="status">Pary: {matched.length / 2}/6 · Próby: {tries}</p></div>;
}
function SequencePuzzle({ seed, onWin }: GameProps) {
  const [sequence] = useState(() => { const rng = seededRandom(seed); return Array.from({ length: 5 + seed % 3 }, () => Math.floor(rng() * 4)); });
  const [mode, setMode] = useState<"ready" | "show" | "answer">("ready"), [light, setLight] = useState<number | null>(null), [step, setStep] = useState(0), [message, setMessage] = useState("Obejrzyj sekwencję, a potem ją powtórz.");
  useEffect(() => {
    if (mode !== "show") return;
    const timers: number[] = [];
    sequence.forEach((n, i) => {
      timers.push(window.setTimeout(() => setLight(n), 500 + i * 850));
      timers.push(window.setTimeout(() => setLight(null), 1050 + i * 850));
    });
    timers.push(window.setTimeout(() => { setMode("answer"); setMessage("Teraz Twoja kolej. Klikaj symbole we właściwej kolejności."); }, sequence.length * 850 + 500));
    return () => timers.forEach(t => window.clearTimeout(t));
  }, [mode, sequence]);
  function pick(n: number) {
    if (mode !== "answer") return;
    if (n !== sequence[step]) { setMode("ready"); setStep(0); setMessage("Nie ta kolejność. Możesz obejrzeć sygnał ponownie."); return; }
    if (step + 1 === sequence.length) onWin(); else setStep(step + 1);
  }
  return <div className="cm-puzzle-body"><p>Zapamiętaj <b>{sequence.length} sygnałów</b>. Podczas pokazu symbole są nieaktywne.</p>
    <div className="cm-runes cm-runes--four">{SIGNS.slice(0, 4).map((s, i) => <button type="button" key={s} disabled={mode !== "answer"} className={light === i ? "lit" : ""} onClick={() => pick(i)}>{s}</button>)}</div>
    <p className="cm-puzzle-feedback" role="status">{message} {mode === "answer" ? `${step}/${sequence.length}` : ""}</p>
    {mode === "ready" && <button type="button" className="cm-primary" onClick={() => { setStep(0); setMode("show"); setMessage("Patrz na zapalające się symbole…"); }}>Pokaż sekwencję</button>}</div>;
}
export function toggleLights(board: boolean[], index: number): boolean[] {
  const x = index % 3, y = Math.floor(index / 3);
  return board.map((v, i) => Math.abs(i % 3 - x) + Math.abs(Math.floor(i / 3) - y) <= 1 ? !v : v);
}
function LightsPuzzle({ seed, onWin }: GameProps) {
  const [initial] = useState(() => { let board = Array<boolean>(9).fill(true); for (const i of shuffle([0,1,2,3,4,5,6,7,8], seed).slice(0, 4 + seed % 3)) board = toggleLights(board, i); return board.every(Boolean) ? toggleLights(board, 4) : board; });
  const [board, setBoard] = useState(initial), [moves, setMoves] = useState(0);
  function pick(i: number) { const next = toggleLights(board, i); setBoard(next); setMoves(m => m + 1); if (next.every(Boolean)) onWin(); }
  return <div className="cm-puzzle-body"><p>Zapal <b>wszystkie 9 run</b>. Kliknięcie przełącza wybraną runę i jej sąsiadów w pionie oraz poziomie.</p>
    <div className="cm-runes cm-runes--three cm-lights">{board.map((v, i) => <button key={i} type="button" className={v ? "lit" : ""} aria-label={`Runa ${i + 1}, ${v ? "zapalona" : "zgaszona"}`} onClick={() => pick(i)}>{SIGNS[i % SIGNS.length]}</button>)}</div>
    <p role="status">Zapalone: {board.filter(Boolean).length}/9 · Ruchy: {moves}</p><button type="button" className="cm-secondary" onClick={() => { setBoard(initial); setMoves(0); }}>Przywróć układ początkowy</button></div>;
}
function TimingPuzzle({ seed, onWin }: GameProps) {
  const difficulty = 1 + Math.abs(seed % 5);
  const targetWidth = Math.max(0.095, 0.21 - (difficulty - 1) * 0.025);
  const min = 0.18 + ((Math.abs(seed) % 47) / 100) * (0.62 - targetWidth);
  const max = min + targetWidth;

  /*
    Poziom 1: spokojny trening.
    Poziom 5: znacznie szybszy znacznik i węższa strefa.
    speed oznacza część szerokości paska pokonywaną w 1 sekundę.
  */
  const speed = 0.46 + (difficulty - 1) * 0.115;

  const [running, setRunning] = useState(true);
  const [hits, setHits] = useState(0);
  const [message, setMessage] = useState(
    `Poziom ${difficulty}: zatrzymaj znacznik 3 razy z rzędu w zielonej strefie.`
  );

  const markerRef = useRef<HTMLElement | null>(null);
  const runningRef = useRef(true);
  const positionRef = useRef(0.035);
  const directionRef = useRef(1);
  const lastFrameRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const restartTimerRef = useRef<number | null>(null);

  /*
    Ruch znacznika jest wykonywany bezpośrednio na elemencie DOM.
    Nie aktualizujemy React state 60 razy na sekundę, dzięki czemu suwak nie
    zatrzymuje się przy cięższych renderach mapy / walki.
  */
  useEffect(() => {
    let disposed = false;

    const drawMarker = () => {
      if (markerRef.current) {
        markerRef.current.style.left = `${positionRef.current * 100}%`;
      }
    };

    drawMarker();

    const tick = (time: number) => {
      if (disposed) return;

      if (lastFrameRef.current === null) {
        lastFrameRef.current = time;
      }

      const deltaSeconds = Math.min(
        0.045,
        Math.max(0, (time - lastFrameRef.current) / 1000)
      );
      lastFrameRef.current = time;

      if (runningRef.current) {
        let next =
          positionRef.current + directionRef.current * speed * deltaSeconds;

        /* Odbicie od krawędzi bez teleportowania znacznika. */
        while (next > 1 || next < 0) {
          if (next > 1) {
            next = 2 - next;
            directionRef.current = -1;
          } else if (next < 0) {
            next = -next;
            directionRef.current = 1;
          }
        }

        positionRef.current = Math.max(0, Math.min(1, next));
        drawMarker();
      }

      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      disposed = true;
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      if (restartTimerRef.current !== null) {
        window.clearTimeout(restartTimerRef.current);
      }
    };
  }, [speed]);

  function scheduleRestart() {
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current);
    }

    restartTimerRef.current = window.setTimeout(() => {
      /* Po każdym strzale startujemy w przeciwnym kierunku. */
      directionRef.current *= -1;
      lastFrameRef.current = null;
      runningRef.current = true;
      setRunning(true);
    }, 430);
  }

  function stop() {
    if (!runningRef.current) return;

    runningRef.current = false;
    setRunning(false);

    const pos = positionRef.current;
    const hit = pos >= min && pos <= max;

    if (hit) {
      const nextHits = hits + 1;
      setHits(nextHits);

      if (nextHits >= 3) {
        setMessage("3/3 — mechanizm otwarty.");
        onWin();
        return;
      }

      setMessage(`Trafienie ${nextHits}/3. Następna próba…`);
      scheduleRestart();
      return;
    }

    setHits(0);
    setMessage("Pudło — seria wraca do 0/3. Następna próba…");
    scheduleRestart();
  }

  return <div className="cm-puzzle-body">
    <p>
      Zatrzymaj poruszający się znacznik w <b>zielonej strefie</b>. Potrzebne są
      <b> trzy kolejne trafienia</b>. Poziom {difficulty}/5 — wyższy poziom oznacza
      szybszy znacznik i węższą strefę.
    </p>

    <div className="cm-timing" aria-label={`Mechanizm zręcznościowy poziom ${difficulty}`}>
      <span
        className="cm-timing-zone"
        style={{ left: `${min * 100}%`, width: `${(max - min) * 100}%` }}
      />
      <i ref={markerRef} style={{ left: "3.5%", willChange: "left" }} />
    </div>

    <button
      type="button"
      className="cm-primary cm-timing-stop"
      onClick={stop}
      disabled={!running}
    >
      {running ? "ZATRZYMAJ" : "SPRAWDZAM…"}
    </button>

    <p className="cm-puzzle-feedback" role="status">{message}</p>

    <div className="cm-hit-dots">
      {[1, 2, 3].map((n) => (
        <span key={n} className={n <= hits ? "lit" : ""}>
          {n <= hits ? "✓" : n}
        </span>
      ))}
    </div>
  </div>;
}

function SlidePuzzle({ seed, onWin }: GameProps) {
  const [initial] = useState(() => {
    const rng = seededRandom(seed), values = [1,2,3,4,5,6,7,8,0]; let previous = -1;
    for (let n = 0; n < 60; n++) {
      const zero = values.indexOf(0); const choices = values.map((_, i) => i).filter(i => i !== previous && Math.abs(i % 3 - zero % 3) + Math.abs(Math.floor(i / 3) - Math.floor(zero / 3)) === 1);
      const next = choices[Math.floor(rng() * choices.length)]; [values[next], values[zero]] = [values[zero], values[next]]; previous = zero;
    }
    if (values.every((v, i) => v === (i + 1) % 9)) [values[7], values[8]] = [values[8], values[7]];
    return values;
  });
  const [board, setBoard] = useState(initial), [moves, setMoves] = useState(0);
  function adjacent(i: number) { const z = board.indexOf(0); return Math.abs(i % 3 - z % 3) + Math.abs(Math.floor(i / 3) - Math.floor(z / 3)) === 1; }
  function move(i: number) { if (!adjacent(i)) return; const b = [...board], z = b.indexOf(0); [b[z], b[i]] = [b[i], b[z]]; setBoard(b); setMoves(m => m + 1); if (b.every((n, j) => n === (j + 1) % 9)) onWin(); }
  return <div className="cm-puzzle-body"><p>Ułóż płyty: <b>1–2–3 / 4–5–6 / 7–8–puste</b>. Przesuwaj tylko płytę obok pustego miejsca.</p>
    <div className="cm-runes cm-runes--three cm-slide">{board.map((n, i) => <button type="button" key={i} disabled={!n || !adjacent(i)} className={!n ? "empty" : ""} onClick={() => move(i)} aria-label={n ? `Przesuń płytę ${n}` : "Puste miejsce"}>{n || ""}</button>)}</div>
    <p role="status">Przesunięcia: {moves}</p><button type="button" className="cm-secondary" onClick={() => { setBoard(initial); setMoves(0); }}>Przywróć układ początkowy</button></div>;
}
