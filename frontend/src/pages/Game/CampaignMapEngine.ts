/** Pure map rules. No timers, storage or React state writes live in this module. */
import { CAMPAIGN_MISSIONS, CAMPAIGN_VERSION, TOWER_COST, GUARD_COST, TOWER_UPGRADE_COST, missionAt, taskReward } from "./CampaignMapData";
import type { CampaignPuzzleKind, CampaignTaskKind } from "./CampaignMapData";
import type { GameProgress, GameReward, ResourceCost } from "./Progress";

export type TerritoryOwner = "player" | "neutral" | "bear";
export interface CampaignTower {
  level: number;
  guards: number;
  crossbows?: number;
  ballistae?: number;
  fortress?: boolean;
}
export interface CampaignSite { done: string[]; cleared: boolean; owner: TerritoryOwner; tower: CampaignTower | null; bearPressure: number; }
export interface CampaignAttempt {
  id: string; mission: number; taskId: string; kind: CampaignTaskKind;
  purpose: "mission" | "supplies" | "recapture"; seed: number;
}
export interface CampaignReport { id: string; turn: number; mission: number; text: string; }
export interface CampaignMapState {
  version: number; revision: number; turn: number; phase: "player" | "enemy";
  current: number; unlockedThrough: number; moved: boolean; actionsLeft: number;
  sites: Record<string, CampaignSite>; attempt: CampaignAttempt | null;
  serial: number; reports: CampaignReport[]; discoveries: string[]; rescuedNPCs: string[];
}
export type CampaignAction =
  | { type: "move"; mission: number }
  | { type: "start"; mission: number; taskId?: string; purpose: CampaignAttempt["purpose"] }
  | { type: "finish"; attemptId: string }
  | { type: "abandon"; attemptId: string }
  | { type: "build"; mission: number }
  | { type: "guards"; mission: number; count: number }
  | { type: "upgrade"; mission: number }
  | { type: "end-turn" }
  | { type: "enemy-turn"; turn: number };
export interface CampaignTransition { state: CampaignMapState; reward?: GameReward; cost?: ResourceCost; message: string; changed: boolean; }
export const MAP_ACTIONS_PER_TURN = 2;
export const RESOURCE_KEYS = ["memeEnergy", "relics", "intel", "bearFragments", "comicFragments", "cardFragments", "crowns"] as const;
export const RESOURCE_NAMES: Record<typeof RESOURCE_KEYS[number], string> = {
  memeEnergy: "Energy", relics: "Relikty", intel: "Intel", bearFragments: "Fragmenty niedźwiedzia",
  comicFragments: "Fragmenty komiksu", cardFragments: "Fragmenty kart", crowns: "PLPEki",
};

export function seededRandom(seed: number): () => number {
  let x = seed >>> 0;
  return () => { x += 0x6D2B79F5; let t = Math.imul(x ^ (x >>> 15), 1 | x); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function shuffle<T>(items: T[], seed: number): T[] {
  const random = seededRandom(seed), copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
}
export function initialCampaign(): CampaignMapState {
  const sites: Record<string, CampaignSite> = {};
  for (const m of CAMPAIGN_MISSIONS) {
    // Nowa kampania startuje 0 : 0. Wszystkie punkty są neutralne.
    // PolishPepe ma bazę w Klasztorze poza numerowaną trasą,
    // a Bear Army rozpoczyna ekspansję od Ciemnej Doliny dopiero w swojej turze.
    sites[m.id] = { done: [], cleared: false, owner: "neutral", tower: null, bearPressure: 0 };
  }
  return { version: CAMPAIGN_VERSION, revision: 0, turn: 1, phase: "player", current: 0, unlockedThrough: 1, moved: false, actionsLeft: 2, sites, attempt: null, serial: 0, reports: [], discoveries: [], rescuedNPCs: [] };
}
function object(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function bounded(value: unknown, fallback: number, min: number, max: number): number { return typeof value === "number" && Number.isFinite(value) ? Math.max(min, Math.min(max, Math.floor(value))) : fallback; }
function strings(value: unknown): string[] { return Array.isArray(value) ? [...new Set(value.filter((v): v is string => typeof v === "string"))] : []; }
export function normalizeCampaign(value: unknown): CampaignMapState {
  const base = initialCampaign(), raw = object(value);
  if (raw.version !== CAMPAIGN_VERSION) return base;
  const rawSites = object(raw.sites);
  for (const m of CAMPAIGN_MISSIONS) {
    const site = object(rawSites[m.id]); if (!Object.keys(site).length) continue;
    const done = strings(site.done).filter(id => m.tasks.some(t => t.id === id));
    const t = object(site.tower);
    const owner: TerritoryOwner = site.owner === "bear" || site.owner === "player" ? site.owner : "neutral";
    const tower = Object.keys(t).length ? {
      level: bounded(t.level, 1, 1, 3),
      guards: bounded(t.guards, 0, 0, 9),
      crossbows: bounded(t.crossbows, 0, 0, 2),
      ballistae: bounded(t.ballistae, 0, 0, 2),
      fortress: t.fortress === true,
    } : null;
    if (tower) tower.guards = Math.min(tower.guards, tower.level * 3);
    base.sites[m.id] = {
      done,
      cleared: done.length === m.tasks.length,
      owner: owner === "player" && !tower ? "neutral" : owner,
      tower,
      bearPressure: bounded(site.bearPressure, 0, 0, 2),
    };
  }
  base.revision = bounded(raw.revision, 0, 0, 1e9);
  base.turn = bounded(raw.turn, 1, 1, 1e8);
  base.phase = raw.phase === "enemy" ? "enemy" : "player";
  base.unlockedThrough = bounded(raw.unlockedThrough, 1, 1, CAMPAIGN_MISSIONS.length);
  base.current = bounded(raw.current, 0, 0, base.unlockedThrough);
  base.moved = raw.moved === true;
  base.actionsLeft = bounded(raw.actionsLeft, 2, 0, MAP_ACTIONS_PER_TURN);
  base.serial = bounded(raw.serial, 0, 0, 1e9);
  base.discoveries = strings(raw.discoveries);
  base.rescuedNPCs = strings(raw.rescuedNPCs);
  base.reports = Array.isArray(raw.reports) ? raw.reports.filter((v): v is CampaignReport => {
    const r = object(v); return typeof r.id === "string" && typeof r.text === "string" && typeof r.turn === "number" && typeof r.mission === "number";
  }).slice(-120) : [];
  const a = object(raw.attempt), m = missionAt(Number(a.mission));
  if (typeof a.id === "string" && typeof a.taskId === "string" && typeof a.seed === "number" &&
      (a.purpose === "mission" || a.purpose === "supplies" || a.purpose === "recapture") &&
      ["compare", "memory", "sequence", "lights", "timing", "slide", "battle"].includes(String(a.kind)) &&
      Number(a.mission) === base.current && (m || (a.mission === 0 && a.purpose === "supplies"))) {
    base.attempt = a as unknown as CampaignAttempt;
  }
  return base;
}
export function siteAt(state: CampaignMapState, order: number): CampaignSite | undefined { const m = missionAt(order); return m ? state.sites[m.id] : undefined; }
export function isUnlocked(state: CampaignMapState, order: number): boolean { return Number.isInteger(order) && order >= 0 && order <= state.unlockedThrough; }
export function canMoveTo(state: CampaignMapState, order: number): boolean {
  return state.phase === "player" && !state.attempt && !state.moved && isUnlocked(state, order) && Math.abs(order - state.current) === 1;
}
export function affordable(progress: GameProgress, cost: ResourceCost): boolean {
  return RESOURCE_KEYS.every(k => Number.isFinite(progress[k]) && progress[k] >= (cost[k] ?? 0));
}
function sumCost(cost: ResourceCost, count: number): ResourceCost { return Object.fromEntries(Object.entries(cost).map(([k, v]) => [k, (v ?? 0) * count])); }
function report(state: CampaignMapState, mission: number, text: string): void {
  state.reports = [...state.reports, { id: `${state.turn}-${state.revision}-${state.reports.length}`, turn: state.turn, mission, text }].slice(-120);
}
function unchanged(state: CampaignMapState, message: string): CampaignTransition { return { state, message, changed: false }; }

/** Must be called from an event handler / transaction, never from a React state updater. */
export function transitionCampaign(original: CampaignMapState, action: CampaignAction, progress: GameProgress): CampaignTransition {
  if (action.type === "enemy-turn") {
    if (original.phase !== "enemy" || action.turn !== original.turn) {
      return unchanged(original, "Ta tura została już rozliczona.");
    }

    const state = structuredClone(original);
    const rng = seededRandom(state.turn * 7919 + 37);
    state.revision++;

    const bearOwned = () => CAMPAIGN_MISSIONS.filter((mission) =>
      state.sites[mission.id]?.owner === "bear"
    );

    const towerDefense = (tower: CampaignTower | null | undefined) => {
      if (!tower) return 0;
      return (tower.level * 3) +
        (tower.guards * 3) +
        ((tower.crossbows ?? 0) * 4) +
        ((tower.ballistae ?? 0) * 7) +
        (tower.fortress ? 8 : 0);
    };

    const developBearTower = () => {
      const owned = [...bearOwned()].sort((a, b) => a.order - b.order);
      if (!owned.length) return false;

      // Najpierw rozwijany jest front najbliżej PolishPepe.
      const front = owned[0];
      const site = state.sites[front.id];
      if (!site.tower) {
        site.tower = { level: 1, guards: 0, crossbows: 0, ballistae: 0, fortress: false };
      }

      const tower = site.tower;
      const capacity = tower.level * 3;

      if (tower.guards < capacity) {
        tower.guards++;
        report(state, front.order, `Bear Army rekrutuje strażnika w punkcie ${String(front.order).padStart(2, "0")}. Załoga: ${tower.guards}/${capacity}.`);
        return true;
      }

      if (tower.level < 3) {
        tower.level++;
        report(state, front.order, `Bear Army ulepsza wieżę ${String(front.order).padStart(2, "0")} do poziomu ${tower.level}.`);
        return true;
      }

      if ((tower.crossbows ?? 0) < 2) {
        tower.crossbows = (tower.crossbows ?? 0) + 1;
        report(state, front.order, `Na wieży ${String(front.order).padStart(2, "0")} pojawia się kusza obronna (${tower.crossbows}/2).`);
        return true;
      }

      if ((tower.ballistae ?? 0) < 2) {
        tower.ballistae = (tower.ballistae ?? 0) + 1;
        report(state, front.order, `Bear Army ustawia balistę w punkcie ${String(front.order).padStart(2, "0")} (${tower.ballistae}/2).`);
        return true;
      }

      if (!tower.fortress) {
        tower.fortress = true;
        report(state, front.order, `Wieża ${String(front.order).padStart(2, "0")} została rozbudowana do fortecy.`);
        return true;
      }

      return false;
    };

    const attackOrExpand = () => {
      const owned = [...bearOwned()].sort((a, b) => a.order - b.order);

      // Pierwsza tura niedźwiedzi: dopiero teraz pojawia się ich pierwszy czerwony punkt.
      if (!owned.length) {
        const startMission = CAMPAIGN_MISSIONS[CAMPAIGN_MISSIONS.length - 1];
        const site = state.sites[startMission.id];
        site.owner = "bear";
        site.bearPressure = 0;
        site.tower = { level: 1, guards: 1, crossbows: 0, ballistae: 0, fortress: false };
        report(state, startMission.order, `Bear Army zajmuje pierwszy punkt przy Ciemnej Dolinie: ${String(startMission.order).padStart(2, "0")}. Wyścig o mapę rozpoczęty.`);
        return true;
      }

      const front = owned[0];
      const targetOrder = front.order - 1;
      const targetMission = missionAt(targetOrder);
      if (!targetMission) return false;

      const attackerSite = state.sites[front.id];
      const targetSite = state.sites[targetMission.id];

      if (targetSite.owner === "neutral") {
        // Symmetric territory pressure: Bear Army also needs time to occupy a
        // neutral node. The first strategic action scouts/pressures the point;
        // the second successful pressure captures it. This mirrors the player's
        // need to spend actions on mission stages instead of letting AI paint one
        // node red every single enemy turn.
        targetSite.bearPressure = Math.min(2, (targetSite.bearPressure ?? 0) + 1);

        if (targetSite.bearPressure < 2) {
          report(state, targetOrder, `Bear Army naciska na neutralny punkt ${String(targetOrder).padStart(2, "0")} (presja 1/2). Masz turę na reakcję.`);
          return true;
        }

        targetSite.owner = "bear";
        targetSite.bearPressure = 0;
        targetSite.tower = {
          level: 1,
          guards: state.turn >= 8 ? 2 : 1,
          crossbows: 0,
          ballistae: 0,
          fortress: false,
        };
        report(state, targetOrder, `Bear Army kończy natarcie i zajmuje neutralny punkt ${String(targetOrder).padStart(2, "0")}. Powstaje nowa wieża.`);
        return true;
      }

      if (targetSite.owner === "player") {
        const attackPower = 5 +
          Math.min(10, Math.floor(state.turn / 5)) +
          (attackerSite.tower?.level ?? 1) * 2 +
          Math.floor(rng() * 4);
        const defense = towerDefense(targetSite.tower);

        if (defense >= attackPower) {
          if (targetSite.tower && targetSite.tower.guards > 0 && rng() < 0.55) {
            targetSite.tower.guards--;
          }
          report(state, targetOrder, `Twoja obrona odpiera natarcie na punkt ${String(targetOrder).padStart(2, "0")} (${defense} obrony / ${attackPower} ataku).`);
        } else {
          const capturedLevel = Math.max(1, (targetSite.tower?.level ?? 1) - 1);
          targetSite.owner = "bear";
          targetSite.tower = {
            level: capturedLevel,
            guards: 1,
            crossbows: 0,
            ballistae: 0,
            fortress: false,
          };
          report(state, targetOrder, `Bear Army przełamuje front i przejmuje punkt ${String(targetOrder).padStart(2, "0")} (${attackPower} ataku / ${defense} obrony). Ukończone etapy misji zostają zachowane.`);
        }
        return true;
      }

      return false;
    };

    // AI rozwija się co turę. 2 z 3 tur próbuje przesuwać front,
    // a co trzecią inwestuje w garnizon, wieżę, kusze, balisty i fortecę.
    const shouldDevelop = state.turn % 3 === 0;
    let acted = shouldDevelop ? developBearTower() : attackOrExpand();

    if (!acted) acted = shouldDevelop ? attackOrExpand() : developBearTower();
    if (!acted) report(state, 0, "Bear Army utrzymuje linię frontu i gromadzi zasoby na następną turę.");

    state.turn++;
    state.phase = "player";
    state.moved = false;
    state.actionsLeft = MAP_ACTIONS_PER_TURN;

    return {
      state,
      changed: true,
      message: `Twoja tura ${state.turn}. Przywrócono 1 ruch i 2 działania.`,
    };
  }
  if (original.phase !== "player") return unchanged(original, "Poczekaj na zakończenie tury niedźwiedzi.");
  if (action.type === "end-turn") {
    if (original.attempt) return unchanged(original, "Dokończ rozpoczęte zadanie albo je opuść.");
    return { state: { ...original, phase: "enemy", revision: original.revision + 1 }, changed: true, message: "Tura niedźwiedzi…" };
  }
  if (action.type === "abandon") {
    if (original.attempt?.id !== action.attemptId) return unchanged(original, "To zadanie nie jest już aktywne.");
    return { state: { ...original, attempt: null, revision: original.revision + 1 }, changed: true, message: "Zadanie przerwane. Wykorzystane działanie nie jest zwracane." };
  }
  if (action.type === "move") {
    if (!canMoveTo(original, action.mission)) return unchanged(original, "Możesz przejść tylko do sąsiedniego odblokowanego punktu, raz na turę.");
    return { state: { ...original, current: action.mission, moved: true, revision: original.revision + 1 }, changed: true, message: action.mission ? `Dotarto do misji ${String(action.mission).padStart(2, "0")}.` : "Dotarto do Klasztoru." };
  }
  if (action.type === "finish") {
    const a = original.attempt;
    if (!a || a.id !== action.attemptId) return unchanged(original, "Nagroda została już rozliczona.");
    const state = structuredClone(original); state.revision++; state.attempt = null;
    if (a.purpose === "supplies") {
      const reward: GameReward = { memeEnergy: 18, crowns: 16, relics: state.serial % 3 === 0 ? 1 : 0, intel: state.serial % 4 === 0 ? 1 : 0 };
      report(state, a.mission, "Zdobyto zapasy z zadania terenowego: 18 Energy, 16 PLPEków oraz znalezione materiały.");
      return { state, reward, changed: true, message: "Zapasy trafiły do wspólnego ekwipunku." };
    }
    const m = missionAt(a.mission); if (!m) return unchanged(original, "Nie znaleziono misji.");
    const s = state.sites[m.id];
    if (a.purpose === "recapture") {
      if (!s.cleared || s.owner !== "bear") return unchanged(original, "Ten garnizon został już pokonany.");
      s.owner = "neutral"; s.tower = null; s.bearPressure = 0;
      report(state, m.order, `Garnizon punktu ${m.order} pokonany. Zbuduj wieżę, aby ponownie przejąć teren.`);
      return { state, reward: { memeEnergy: 20, crowns: 20, bearFragments: 1 }, changed: true, message: "Garnizon pokonany. Teren neutralny — możesz odbudować wieżę." };
    }
    const index = m.tasks.findIndex(t => t.id === a.taskId);
    if (index < 0 || s.done.includes(a.taskId) || index !== s.done.length) return unchanged(original, "Etap był już wykonany lub nie jest aktualny.");
    s.done.push(a.taskId);
    // Active play can contest a pressured neutral node. One successfully
    // completed mission step removes one Bear pressure marker, so the player
    // has a meaningful answer instead of watching the AI capture on rails.
    if (s.owner === "neutral" && s.bearPressure > 0) {
      s.bearPressure = Math.max(0, s.bearPressure - 1);
      report(state, m.order, `Działania PolishPepe odpychają Bear Army. Presja na punkt ${String(m.order).padStart(2, "0")} spada do ${s.bearPressure}/2.`);
    }
    const reward = taskReward(m, index);
    if (s.done.length === m.tasks.length) {
      s.cleared = true; s.owner = "neutral"; s.tower = null; s.bearPressure = 0;
      if (m.discoveryId && !state.discoveries.includes(m.discoveryId)) state.discoveries.push(m.discoveryId);
      if (m.rescuedNpcId && !state.rescuedNPCs.includes(m.rescuedNpcId)) state.rescuedNPCs.push(m.rescuedNpcId);
      report(state, m.order, m.outcome);
    }
    return { state, reward, changed: true, message: s.cleared ? "Misja ukończona. Teraz zbuduj wieżę, aby przejąć punkt i otworzyć dalszą drogę." : `Etap ${index + 1}/3 ukończony. Nagroda dodana do ekwipunku.` };
  }
  if (original.attempt) return unchanged(original, "Najpierw dokończ lub opuść aktywne zadanie.");
  if (original.actionsLeft <= 0) return unchanged(original, "Brak działań w tej turze. Zakończ turę.");
  const order = action.mission, m = missionAt(order), s = siteAt(original, order);
  if (order !== original.current || !isUnlocked(original, order)) return unchanged(original, "Najpierw dotrzyj do tego punktu po trasie.");
  if (action.type === "start") {
    if (action.purpose !== "supplies" && (!m || !s)) return unchanged(original, "Wybierz punkt misji.");
    let kind: CampaignTaskKind, taskId: string;
    if (action.purpose === "mission") {
      const task = m!.tasks[s!.done.length];
      if (!task || task.id !== action.taskId) return unchanged(original, "Wykonuj etapy w kolejności 1 → 2 → 3.");
      kind = task.kind; taskId = task.id;
    } else if (action.purpose === "recapture") {
      if (!s!.cleared || s!.owner !== "bear") return unchanged(original, "W tym punkcie nie ma garnizonu do odbicia.");
      kind = "battle"; taskId = "recapture";
    } else {
      if (s?.owner === "bear") return unchanged(original, "Oczyść punkt z niedźwiedzi, zanim zaczniesz szukać zapasów.");
      const kinds: CampaignPuzzleKind[] = ["compare", "memory", "timing", "lights", "slide", "sequence"];
      kind = kinds[original.serial % kinds.length]; taskId = "supplies";
    }
    const serial = original.serial + 1;
    const attempt: CampaignAttempt = { id: `t${original.turn}-a${serial}-m${order}`, mission: order, taskId, kind, purpose: action.purpose, seed: serial * 349 + order * 7919 };
    return { state: { ...original, revision: original.revision + 1, serial, actionsLeft: original.actionsLeft - 1, attempt }, changed: true, message: "Rozpoczęto zadanie." };
  }
  if (!m || !s || !s.cleared) return unchanged(original, "Najpierw ukończ wszystkie 3 etapy misji.");
  const state = structuredClone(original); const site = state.sites[m.id]; state.revision++;
  let cost: ResourceCost;
  if (action.type === "build") {
    if (s.owner !== "neutral" || s.tower) return unchanged(original, "Wieża już stoi albo punkt wciąż należy do wroga.");
    cost = TOWER_COST; if (!affordable(progress, cost)) return unchanged(original, "Za mało zasobów na wieżę. Zdobądź zapasy lub wróć do Areny.");
    site.owner = "player"; site.bearPressure = 0; site.tower = { level: 1, guards: 0 };
    state.unlockedThrough = Math.max(state.unlockedThrough, Math.min(CAMPAIGN_MISSIONS.length, order + 1));
    report(state, order, `Postawiono Twoją wieżę w punkcie ${String(order).padStart(2, "0")}. Teren przejęty. Rekrutuj strażników, aby go utrzymać.`);
  } else if (action.type === "guards") {
    if (s.owner !== "player" || !s.tower) return unchanged(original, "Strażników rekrutujesz wyłącznie we własnej wieży.");
    const count = Math.floor(action.count);
    if (!Number.isFinite(count) || count < 1 || count > s.tower.level * 3 - s.tower.guards) return unchanged(original, "Brak tylu wolnych miejsc w wieży.");
    cost = sumCost(GUARD_COST, count); if (!affordable(progress, cost)) return unchanged(original, "Brakuje zasobów na strażników.");
    site.tower!.guards += count;
    report(state, order, `Do wieży ${String(order).padStart(2, "0")} dołączyło ${count} strażników. Załoga: ${site.tower!.guards}/${site.tower!.level * 3}.`);
  } else if (action.type === "upgrade") {
    if (s.owner !== "player" || !s.tower || s.tower.level >= 3) return unchanged(original, "Tej wieży nie można teraz ulepszyć.");
    cost = sumCost(TOWER_UPGRADE_COST, s.tower.level); if (!affordable(progress, cost)) return unchanged(original, "Brakuje zasobów na ulepszenie wieży.");
    site.tower!.level++;
    report(state, order, `Wieża ${String(order).padStart(2, "0")} osiągnęła poziom ${site.tower!.level}.`);
  } else return unchanged(original, "Nieznana akcja.");
  state.actionsLeft--;
  return { state, cost, changed: true, message: action.type === "build" ? "Wieża postawiona. Punkt świeci na zielono. Następna misja jest odblokowana." : "Załoga i umocnienia zapisane." };
}

/** Same XP thresholds as Progress.ts; map transactions commit progress and campaign together. */
export function applyCampaignResources(current: GameProgress, reward: GameReward = {}, cost: ResourceCost = {}): GameProgress {
  const next = structuredClone(current);
  for (const k of RESOURCE_KEYS) next[k] = Math.max(0, (Number.isFinite(current[k]) ? current[k] : 0) + (reward[k] ?? 0) - (cost[k] ?? 0));
  const pepe = next.polishPepe; pepe.xp += Math.max(0, reward.xp ?? 0);
  pepe.xpRequired = Math.max(1, pepe.xpRequired);
  while (pepe.xp >= pepe.xpRequired) { pepe.xp -= pepe.xpRequired; pepe.level++; pepe.skillPoints++; pepe.xpRequired = 100 + (pepe.level - 1) * 50; }
  const bocian = next.bocian; bocian.xp += Math.max(0, reward.bocianXp ?? 0);
  const cap = next.monastery.level >= 3 ? 4 : next.monastery.level >= 2 ? 3 : 2;
  bocian.xpRequired = Math.max(1, bocian.xpRequired);
  while (bocian.xp >= bocian.xpRequired && bocian.rank < cap) { bocian.xp -= bocian.xpRequired; bocian.rank++; bocian.supportLevel++; bocian.skillPoints++; bocian.xpRequired = 100 + (bocian.rank - 1) * 75; }
  return next;
}
