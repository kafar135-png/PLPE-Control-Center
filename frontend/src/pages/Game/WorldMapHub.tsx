import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import worldMapBackground from "../../assets/game/world_map_bg.png";
import charPolishPepe from "../../assets/game/char_polishpepe.png";
import TacticalBattle from "./TacticalBattle";
import InventoryPanel from "./InventoryPanel";
import type { InventoryPanelTab } from "./InventoryPanel";
import { buildEquipmentItems, buildInventoryItems, calculateEquipmentBonuses, equipItem, loadRpgInventoryState, unequipSlot } from "./GameplayInventory";
import { bocianProgressBattleBonuses, pepeProgressBattleBonuses } from "./BattleLoadout";
import type { EquipmentItem, EquipmentSlot, UpgradeHint } from "./GameplayInventory";
import { WORLD_STORY_SCENES, findTriggeredStoryScene, loadWorldStoryState, markStorySceneSeen, saveWorldStoryState } from "./WorldStory";
import type { WorldStoryScene, WorldStoryState } from "./WorldStory";
import StorySceneModal from "./StorySceneModal";
import { canAfford, getBuildingUpgradeCost, loadGameProgress, PLPE_PROGRESS_SYNC_EVENT } from "./Progress";
import type { BuildingKey, GameProgress, ResourceCost } from "./Progress";
import { CAMPAIGN_MISSIONS, BASE_POSITION, TOWER_COST, GUARD_COST, TOWER_UPGRADE_COST, missionAt } from "./CampaignMapData";
import { canMoveTo, initialCampaign, isUnlocked, siteAt, RESOURCE_KEYS, RESOURCE_NAMES } from "./CampaignMapEngine";
import type { CampaignAction, CampaignMapState, TerritoryOwner } from "./CampaignMapEngine";
import { CAMPAIGN_SYNC_EVENT, dispatchCampaign, exportCampaignBackup, initializeCampaign, readCampaign, readCampaignDiscoveries } from "./CampaignMapRepository";
import CampaignMissionPuzzle, { PUZZLE_LABELS } from "./CampaignMissionPuzzle";
import CampaignMapIcon from "./CampaignMapIcons";
import "./CampaignMap.css";

interface WorldMapHubProps { unlockedRegions: number[]; onBack: () => void; onEnterMonastery?: () => void; }
const OWNER_LABEL: Record<TerritoryOwner, string> = { player: "Twoje terytorium", neutral: "Terytorium neutralne", bear: "Terytorium niedźwiedzi" };
const BUILDING_LABELS: Record<BuildingKey, string> = { trainingHall: "Sala Treningowa", cardForge: "Kuźnia Kart", comicArchive: "Archiwum", plpeVault: "Skarbiec", arena: "Arena", expeditions: "Ekspedycje" };
function two(n: number) { return n.toString().padStart(2, "0"); }
function safeRead(): CampaignMapState { try { return readCampaign(); } catch { return initialCampaign(); } }
function scaledCost(cost: ResourceCost, n: number): ResourceCost { return Object.fromEntries(Object.entries(cost).map(([key, value]) => [key, (value ?? 0) * n])); }

export default function WorldMapHub({ onBack, onEnterMonastery }: WorldMapHubProps) {
  const [campaign, setCampaign] = useState<CampaignMapState>(safeRead);
  const [progress, setProgress] = useState<GameProgress>(loadGameProgress);
  const [rpg, setRpg] = useState(loadRpgInventoryState);
  const [selected, setSelected] = useState<number | null>(null);
  const [inventoryTab, setInventoryTab] = useState<InventoryPanelTab | null>(null);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [storyState, setStoryState] = useState<WorldStoryState>(loadWorldStoryState);
  const [storyScene, setStoryScene] = useState<WorldStoryScene | null>(null);
  const [fatalError, setFatalError] = useState("");
  const [busy, setBusy] = useState(false);
  const [recruitCount, setRecruitCount] = useState(1);
  const gate = useRef(false);
  const mounted = useRef(false);
  const canvas = useRef<HTMLDivElement | null>(null);

  const refresh = useCallback(() => {
    if (!mounted.current) return;
    try { setCampaign(readCampaign()); setProgress(loadGameProgress()); setRpg(loadRpgInventoryState()); }
    catch (e) { setFatalError(e instanceof Error ? e.message : "Nie udało się odczytać zapisu mapy."); }
  }, []);
  useEffect(() => {
    mounted.current = true;
    try { initializeCampaign(); refresh(); } catch (e) { setFatalError(e instanceof Error ? e.message : "Nie udało się dokończyć zapisu."); }
    window.addEventListener(CAMPAIGN_SYNC_EVENT, refresh);
    window.addEventListener(PLPE_PROGRESS_SYNC_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => { mounted.current = false; window.removeEventListener(CAMPAIGN_SYNC_EVENT, refresh); window.removeEventListener(PLPE_PROGRESS_SYNC_EVENT, refresh); window.removeEventListener("storage", refresh); };
  }, [refresh]);

  const send = useCallback(async (action: CampaignAction) => {
    if (gate.current) return;
    gate.current = true; setBusy(true);
    try {
      const result = await dispatchCampaign(action);
      if (mounted.current) { refresh(); setNotice(result.message); if (action.type === "start" && result.changed) setChallengeOpen(true); }
    } catch (e) { if (mounted.current) setFatalError(e instanceof Error ? e.message : "Nie udało się zapisać operacji. Postęp nie został zresetowany."); }
    finally { gate.current = false; if (mounted.current) setBusy(false); }
  }, [refresh]);
  useEffect(() => {
    if (campaign.phase !== "enemy" || fatalError) return;
    const timer = window.setTimeout(() => { void send({ type: "enemy-turn", turn: campaign.turn }); }, 1050);
    return () => window.clearTimeout(timer);
  }, [campaign.phase, campaign.turn, fatalError, send]);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(""), 7000); return () => window.clearTimeout(timer); }, [notice]);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => { if (e.key !== "Escape" || challengeOpen) return; setSelected(null); setInventoryTab(null); setReportsOpen(false); };
    window.addEventListener("keydown", escape); return () => window.removeEventListener("keydown", escape);
  }, [challengeOpen]);

  const migrated = useMemo(() => readCampaignDiscoveries(campaign), [campaign]);
  useEffect(() => {
    if (challengeOpen || storyScene || campaign.current <= 0) return;
    const mission = missionAt(campaign.current);
    if (!mission) return;
    const triggered = findTriggeredStoryScene({
      state: storyState,
      turn: campaign.turn,
      locationId: mission.locationId,
      discoveries: migrated.discoveries,
      rescuedNPCs: migrated.rescuedNPCs,
    });
    if (triggered) setStoryScene(triggered);
  }, [campaign.current, campaign.turn, challengeOpen, storyScene, storyState, migrated]);

  function completeStoryScene() {
    if (!storyScene) return;
    const next = markStorySceneSeen(storyState, storyScene.id);
    saveWorldStoryState(next);
    setStoryState(next);
    setStoryScene(null);
  }
  const equipment = useMemo(() => buildEquipmentItems(migrated.discoveries, migrated.rescuedNPCs, progress, progress.polishPepe.specialization).map(item => ({ ...item, unlocked: item.unlocked || rpg.equipped[item.slot] === item.id })), [migrated, progress, rpg]);
  const equipmentBonuses = useMemo(() => calculateEquipmentBonuses(equipment, rpg), [equipment, rpg]);
  const items = useMemo(() => buildInventoryItems(progress, migrated.discoveries, migrated.rescuedNPCs, progress.crowns).map(item => item.id === "crowns" ? { ...item, name: "PLPEki", description: "Waluta gry. Finansuje wieże, strażników i rozwój budynków. Nie jest tokenem w portfelu." } : item), [progress, migrated]);
  const hints = useMemo<UpgradeHint[]>(() => (Object.keys(BUILDING_LABELS) as BuildingKey[]).flatMap(key => {
    const cost = getBuildingUpgradeCost(key, progress.buildings[key]);
    if (!cost || !canAfford(progress, cost)) return [];
    return [{ id: key, building: "Klasztor" as const, title: `Gotowe ulepszenie: ${BUILDING_LABELS[key]}`, description: `${BUILDING_LABELS[key]} — masz wymagane zasoby na kolejny poziom.`, ready: true }];
  }), [progress]);
  const journalScenes = useMemo<WorldStoryScene[]>(() => [
    ...WORLD_STORY_SCENES.map(scene => ({
      ...scene,
      text: scene.dialogue?.map(line => `${line.speaker}: ${line.text}`) ?? scene.text,
    })),
    ...CAMPAIGN_MISSIONS.filter(m => campaign.sites[m.id].cleared).map(m => ({ id: `campaign-note-${m.id}`, title: `${two(m.order)} · ${m.title}`, speaker: "Dziennik wyprawy", text: [m.briefing, ...m.tasks.map((task, i) => `${i + 1}. ${task.title} — ukończone.`), m.outcome], note: m.outcome, trigger: {} })),
  ], [campaign]);
  const seenNotes = [...loadWorldStoryState().seenSceneIds, ...journalScenes.filter(s => s.id.startsWith("campaign-note-")).map(s => s.id)];
  const completed = CAMPAIGN_MISSIONS.filter(m => campaign.sites[m.id].cleared).length;
  const owned = CAMPAIGN_MISSIONS.filter(m => campaign.sites[m.id].owner === "player").length;
  const enemyCount = CAMPAIGN_MISSIONS.filter(m => campaign.sites[m.id].owner === "bear").length;
  const currentMission = missionAt(campaign.current);
  const currentSite = siteAt(campaign, campaign.current);
  const chosen = selected === null ? undefined : missionAt(selected);
  const chosenSite = selected === null ? undefined : siteAt(campaign, selected);
  const reached = selected === campaign.current;
  const unlocked = selected !== null && isUnlocked(campaign, selected);
  const actionsDisabled = busy || !!fatalError || campaign.phase !== "player" || campaign.actionsLeft === 0 || !!campaign.attempt;
  const activeAttempt = campaign.attempt;
  const attemptMission = activeAttempt ? missionAt(activeAttempt.mission) : undefined;
  const isBattle = challengeOpen && activeAttempt?.kind === "battle";

  function chooseNode(order: number) { setSelected(order); setRecruitCount(1); setNotice(""); }
  function closeChallenge() {
    if (!activeAttempt || busy) return;
    setChallengeOpen(false);
    void send({ type: "abandon", attemptId: activeAttempt.id });
  }
  async function finishChallenge() {
    if (!activeAttempt || busy) return;
    await send({ type: "finish", attemptId: activeAttempt.id });
    if (mounted.current) setChallengeOpen(false);
  }
  function downloadBackup() {
    const data = exportCampaignBackup(), url = URL.createObjectURL(new Blob([data], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = "PLPE-zapis-kopii.json"; a.click(); URL.revokeObjectURL(url);
  }
  function costView(cost: ResourceCost, label = "Koszt") {
    return <div className="cm-cost"><small>{label}</small><div>{RESOURCE_KEYS.filter(k => (cost[k] ?? 0) > 0).map(key => <span key={key} className={progress[key] >= (cost[key] ?? 0) ? "enough" : "missing"}><b>{cost[key]}</b> {RESOURCE_NAMES[key]} <em>masz {progress[key]}</em></span>)}</div></div>;
  }
  function towerPanel() {
    if (!chosen || !chosenSite) return null;
    const tower = chosenSite.tower;
    if (!chosenSite.cleared) return <section className="cm-section"><h3><CampaignMapIcon kind="tower"/>Przejęcie terenu</h3><p>Najpierw wykonaj 3 etapy misji. Samo wejście na punkt go nie zdobywa.</p>{costView(TOWER_COST, "Wieża po ukończeniu misji")}</section>;
    if (chosenSite.owner === "bear") return <section className="cm-section"><h3>Czerwony garnizon</h3><p>Klan odbił ten punkt. Misja pozostaje ukończona, ale do odbudowy wieży trzeba pokonać załogę.</p><button type="button" className="cm-danger" disabled={!reached || actionsDisabled} onClick={() => void send({ type: "start", mission: chosen.order, purpose: "recapture" })}>Odbij garnizon · 1 działanie</button></section>;
    if (!tower) return <section className="cm-section cm-section--capture"><h3><CampaignMapIcon kind="tower"/>Misja ukończona — postaw wieżę</h3><p>Wieża zmieni punkt na zielony i odblokuje kolejną misję. Strażników kupujesz osobno.</p>{costView(TOWER_COST)}<button type="button" className="cm-primary" disabled={!reached || actionsDisabled || !canAfford(progress, TOWER_COST)} onClick={() => void send({ type: "build", mission: chosen.order })}>Zbuduj wieżę i przejmij teren</button><small>Budowa zużywa 1 działanie, nie zużywa ruchu.</small></section>;
    const room = tower.level * 3 - tower.guards;
    const count = Math.min(recruitCount, Math.max(1, room));
    return <section className="cm-section"><h3><CampaignMapIcon kind="tower"/>Twoja wieża · poziom {tower.level}</h3><div className="cm-tower-stats"><span><b>{tower.guards}/{tower.level * 3}</b> strażników</span><span><b>{tower.level * 3 + tower.guards * 3}</b> siły obrony</span></div>
      <p>Wieża i strażnicy bronią tego punktu podczas tury niedźwiedzi. Wynik natarcia zobaczysz w meldunkach.</p>
      {room > 0 && <><label className="cm-quantity">Liczba strażników<select value={count} onChange={e => setRecruitCount(Number(e.target.value))}>{Array.from({ length: room }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}</select></label>{costView(scaledCost(GUARD_COST, count))}<button type="button" className="cm-primary" disabled={!reached || actionsDisabled || !canAfford(progress, scaledCost(GUARD_COST, count))} onClick={() => void send({ type: "guards", mission: chosen.order, count })}>Rekrutuj strażników · 1 działanie</button></>}
      {room === 0 && <p className="cm-success">Załoga jest kompletna.</p>}
      {tower.level < 3 && <>{costView(scaledCost(TOWER_UPGRADE_COST, tower.level), "Koszt kolejnego poziomu wieży")}<button type="button" className="cm-secondary" disabled={!reached || actionsDisabled || !canAfford(progress, scaledCost(TOWER_UPGRADE_COST, tower.level))} onClick={() => void send({ type: "upgrade", mission: chosen.order })}>Ulepsz wieżę · +3 miejsca</button></>}
    </section>;
  }

  const body = <main className="plpe-campaign-shell" data-campaign-version="9.0" data-turn={campaign.turn} data-phase={campaign.phase}>
    {isBattle && activeAttempt ? <div className="cm-battle-host"><TacticalBattle
      key={activeAttempt.id} title={activeAttempt.purpose === "recapture" ? `Odbicie punktu ${two(activeAttempt.mission)}` : attemptMission?.tasks.find(t => t.id === activeAttempt.taskId)?.title ?? "Starcie kampanii"}
      enemyGroupId={attemptMission?.enemyGroupId ?? "bear-scout"} enemyLevel={attemptMission?.enemyLevel ?? 1}
      pepeLevel={progress.polishPepe.level} bocianLevel={progress.bocian.rank} pepeClass={progress.polishPepe.specialization}
      pepeBonuses={pepeProgressBattleBonuses(progress, equipmentBonuses)}
      bocianBonuses={bocianProgressBattleBonuses(progress.bocian)}
      rewardText={["Nagroda etapu trafia do wspólnego ekwipunku po potwierdzeniu zwycięstwa."]}
      onVictory={() => void finishChallenge()} onDefeat={closeChallenge} onRetreat={closeChallenge}/></div> : <>
      <header className="cm-hud">
        <div className="cm-brand"><small>POLISHPEPE · KAMPANIA</small><strong>Szlak do Ciemnej Doliny</strong></div>
        <div className="cm-top-stats"><span><small>UKOŃCZONE MISJE</small><b>{completed}<em>/35</em></b></span><span><small>TWOJE WIEŻE</small><b>{owned}</b></span><button type="button" className="cm-enemy-stat" onClick={() => setReportsOpen(true)}><small>KLAN NIEDŹWIEDZI</small><b>{enemyCount}<em> punktów</em></b></button></div>
        <nav className="cm-nav" aria-label="Menu mapy"><button type="button" onClick={() => setInventoryTab("inventory")}><CampaignMapIcon kind="pack"/>Ekwipunek{hints.length > 0 && <i>{hints.length}</i>}</button><button type="button" onClick={() => setInventoryTab("journal")}><CampaignMapIcon kind="book"/>Dziennik</button><button type="button" onClick={onBack}>← Powrót</button></nav>
      </header>
      <section className="cm-map-viewport" aria-label="Mapa kampanii">
        <div className="cm-map-canvas" ref={canvas} style={{ backgroundImage: `url(${worldMapBackground})` }}>
          <div className="cm-map-shade"/>
          <div className="cm-map-caption"><small>JEDEN SZLAK · 35 PUNKTÓW · 105 ETAPÓW</small><strong>Misja → wieża → następny punkt</strong><span>Szary punkt jest neutralny. Ciemny punkt z kłódką czeka na odblokowanie.</span></div>
          <svg className="cm-route" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
            {CAMPAIGN_MISSIONS.map((m, index) => {
              const before = index === 0 ? BASE_POSITION : CAMPAIGN_MISSIONS[index - 1];
              const previousOwner = index === 0 ? "player" : campaign.sites[CAMPAIGN_MISSIONS[index - 1].id].owner;
              const owner = campaign.sites[m.id].owner;
              const edgeOwner = previousOwner === "player" && owner === "player" ? "player" : owner === "bear" && previousOwner === "bear" ? "bear" : "neutral";
              const path = `M ${before.x * 10} ${before.y * 10} L ${m.x * 10} ${m.y * 10}`;
              return <g key={m.id} className={`cm-route-edge ${edgeOwner} ${m.order <= campaign.unlockedThrough ? "open" : "locked"}`} data-route-edge={m.order}>
                <path className="cm-route-outline" d={path} vectorEffect="non-scaling-stroke"/>
                <path className="cm-route-core" d={path} vectorEffect="non-scaling-stroke"/>
              </g>;
            })}
          </svg>
          <button type="button" className={`cm-node cm-node--base player unlocked ${campaign.current === 0 ? "current" : ""}`} style={{ left: `${BASE_POSITION.x}%`, top: `${BASE_POSITION.y}%` }} onClick={() => chooseNode(0)} aria-label="Klasztor — początek trasy"><span className="cm-node-disc"><CampaignMapIcon kind="tower"/></span><span className="cm-node-name">Klasztor</span>{campaign.current === 0 && <span className="cm-you">TU JESTEŚ</span>}</button>
          {CAMPAIGN_MISSIONS.map(m => {
            const site = campaign.sites[m.id], open = isUnlocked(campaign, m.order), current = campaign.current === m.order;
            return <button type="button" key={m.id} data-mission={m.order} data-owner={site.owner} data-unlocked={open} className={`cm-node ${site.owner} ${open ? "unlocked" : "locked"} ${current ? "current" : ""} ${site.cleared ? "cleared" : ""} ${m.order === campaign.unlockedThrough ? "frontier" : ""}`}
              style={{ left: `${m.x}%`, top: `${m.y}%` }} onClick={() => chooseNode(m.order)} aria-label={`Misja ${two(m.order)}: ${open ? m.title : "zablokowana"}. ${OWNER_LABEL[site.owner]}`}>
              <span className="cm-node-disc"><b>{two(m.order)}</b>{!open && <CampaignMapIcon kind="lock" className="cm-node-lock"/>}{site.cleared && <span className="cm-complete-tick">✓</span>}</span>
              <span className="cm-node-name">{open ? m.shortTitle : "?"}</span>
              {site.tower && <span className="cm-node-tower" aria-label={`Wieża poziomu ${site.tower.level}, ${site.tower.guards} strażników`}><CampaignMapIcon kind="tower"/><small>{site.tower.guards}/{site.tower.level * 3}</small></span>}
              {site.owner === "neutral" && site.bearPressure > 0 && <span className="cm-node-pressure" aria-label={`Presja Bear Army ${site.bearPressure}/2`}>🐻 {site.bearPressure}/2</span>}
              {current && <span className="cm-player-pin"><img src={charPolishPepe} alt="PolishPepe"/></span>}
              {current && <span className="cm-you">TU JESTEŚ</span>}
            </button>;
          })}
        </div>
      </section>
      <footer className="cm-footer">
        <div className="cm-legend"><span><i className="player"/>Twoje</span><span><i className="neutral"/>Neutralne</span><span><i className="bear"/>Niedźwiedzie</span><small>MAPA 9.0</small></div>
        <div className="cm-turn-end"><small>{campaign.phase === "enemy" ? "RUCH NIEDŹWIEDZI…" : `TWOJA TURA ${campaign.turn} · RUCH ${campaign.moved ? "0" : "1"}/1 · DZIAŁANIA ${campaign.actionsLeft}/2`}</small><button type="button" className="cm-primary" disabled={busy || !!fatalError || campaign.phase !== "player" || !!campaign.attempt} onClick={() => void send({ type: "end-turn" })}>{campaign.phase === "enemy" ? "Przeciwnik wykonuje ruch…" : "✓ Zakończ turę"}</button></div>
        <div className="cm-resources"><span><b>{progress.memeEnergy}</b> Energy</span><span><b>{progress.relics}</b> Relikty</span><span><b>{progress.crowns}</b> PLPEki</span><button type="button" onClick={() => chooseNode(campaign.current)}>Bieżąca lokacja →</button></div>
      </footer>
      {notice && !inventoryTab && !reportsOpen && !challengeOpen && <div className={`cm-toast ${selected !== null ? "cm-toast--panel" : ""}`} role="status">{notice}<button type="button" aria-label="Zamknij informację" onClick={() => setNotice("")}>×</button></div>}
      {!!campaign.attempt && !challengeOpen && !inventoryTab && selected === null && <button type="button" className="cm-resume cm-primary" onClick={() => setChallengeOpen(true)}>Kontynuuj rozpoczęte zadanie</button>}

      {selected !== null && !inventoryTab && !challengeOpen && <div className="cm-overlay cm-overlay--details" role="dialog" aria-modal="true" aria-label="Szczegóły punktu">
        <button type="button" className="cm-overlay-dismiss" aria-label="Zamknij szczegóły punktu" onClick={() => setSelected(null)}/>
        <section className="cm-mission-panel">
          <header className="cm-panel-head"><div><small>{selected === 0 ? "BAZA WYPRAWY" : `MISJA ${two(selected)} / 35 · AKT ${chosen?.act ?? ""}`}</small><h2>{selected === 0 ? "Klasztor Bociana" : unlocked ? chosen?.title : "Nieodkryty punkt"}</h2></div><button type="button" className="cm-icon-button" onClick={() => setSelected(null)} aria-label="Zamknij szczegóły"><CampaignMapIcon kind="close"/></button></header>
          <div className="cm-panel-scroll">
            {selected === 0 ? <><p>Klasztor jest początkiem jednej trasy. Twoja wyprawa prowadzi przez 35 punktów aż do Ciemnej Doliny.</p>{!reached && <button type="button" className="cm-primary" disabled={busy || !canMoveTo(campaign, 0)} onClick={() => void send({ type: "move", mission: 0 })}>Wróć po trasie · 1 ruch</button>}<button type="button" className="cm-secondary" onClick={onBack}>Wyjdź z mapy</button></> : <>
              <div className={`cm-owner-badge ${chosenSite?.owner}`}><CampaignMapIcon kind={unlocked ? "flag" : "lock"}/>{chosenSite ? OWNER_LABEL[chosenSite.owner] : ""}{!unlocked && " · zablokowane"}</div>
              {!unlocked ? <section className="cm-section"><h3>Najpierw punkt {two(Math.max(1, selected - 1))}</h3><p>Wykonaj jego trzy etapy i zbuduj własną wieżę. Wtedy odblokuje się ten punkt. Nie można go ominąć ani przeskoczyć dalej.</p></section> : <>
                {chosenSite?.owner === "neutral" && chosenSite.bearPressure > 0 && <section className="cm-pressure-warning"><strong>🐻 PRESJA BEAR ARMY {chosenSite.bearPressure}/2</strong><p>Niedźwiedzie nie przejmują już neutralnego pola jednym ruchem. Druga skuteczna presja zajmie punkt — masz czas na reakcję.</p></section>}
                <p className="cm-briefing">{chosen?.briefing}</p>
                {!reached && <section className="cm-section"><h3>Najpierw dotrzyj do lokacji</h3><p>Możesz poruszać się wyłącznie pomiędzy sąsiednimi numerami na trasie. Masz 1 ruch na turę.</p><button type="button" className="cm-primary" disabled={busy || !canMoveTo(campaign, selected)} onClick={() => void send({ type: "move", mission: selected })}>Idź do punktu {two(selected)} · 1 ruch</button></section>}
                <div className="cm-stage-list">{chosen?.tasks.map((task, i) => {
                  const done = chosenSite?.done.includes(task.id), next = chosenSite?.done.length === i;
                  return <article key={task.id} className={`${done ? "done" : next ? "next" : ""}`}><span className="cm-stage-index">{done ? "✓" : i + 1}</span><div><small>{task.kind === "battle" ? "WALKA DRUŻYNOWA" : PUZZLE_LABELS[task.kind]}</small><h3>{task.title}</h3>{next && reached && <button type="button" className="cm-primary" disabled={actionsDisabled} onClick={() => void send({ type: "start", mission: selected, purpose: "mission", taskId: task.id })}>Rozpocznij · 1 działanie</button>}{!next && !done && <small>Najpierw poprzedni etap</small>}</div></article>;
                })}</div>
                {chosen && <div className="cm-reward-summary"><small>ŁĄCZNA NAGRODA ZA 3 ETAPY</small><p>{chosen.reward.memeEnergy} Energy · {chosen.reward.relics} Relikty · {chosen.reward.crowns} PLPEków · {chosen.reward.xp} XP Pepe</p><small>Każdy etap daje część tej nagrody. Nie trzeba zdobywać całego punktu, by otrzymać pierwszy łup.</small></div>}
                {towerPanel()}
              </>}
            </>}
            {reached && campaign.attempt && <section className="cm-section"><h3>Zadanie w toku</h3><p>Wznowienie nie pobiera kolejnego działania.</p><button type="button" className="cm-primary" onClick={() => setChallengeOpen(true)}>Kontynuuj zadanie</button><button type="button" className="cm-secondary" disabled={busy} onClick={closeChallenge}>Porzuć zadanie bez zwrotu działania</button></section>}
            {reached && currentSite?.owner !== "bear" && !campaign.attempt && <section className="cm-section"><h3>Dodatkowe zapasy</h3><p>Rozwiąż zagadkę terenową: +18 Energy, +16 PLPEków. Co trzecie rozpoczęte zadanie terenowe w odpowiednim cyklu może przynieść Relikt. Nagroda dopiero po rozwiązaniu.</p><button type="button" className="cm-secondary" disabled={actionsDisabled} onClick={() => void send({ type: "start", mission: campaign.current, purpose: "supplies" })}>Szukaj zapasów · 1 działanie</button></section>}
            {selected !== null && !reached && <p className="cm-help">Twoja pozycja: {campaign.current ? `${two(campaign.current)} · ${currentMission?.title}` : "Klasztor"}.</p>}
          </div>
          <footer className="cm-panel-foot"><span>Ruch {campaign.moved ? 0 : 1}/1 · Działania {campaign.actionsLeft}/2</span><button type="button" className="cm-secondary" disabled={busy || campaign.phase !== "player" || !!campaign.attempt} onClick={() => void send({ type: "end-turn" })}>Zakończ turę</button></footer>
        </section>
      </div>}

      {reportsOpen && <div className="cm-overlay" role="dialog" aria-modal="true" aria-label="Meldunki terytorialne"><section className="cm-reports"><header className="cm-panel-head"><div><small>WIEŻE I OBRONA TERYTORIUM</small><h2>Meldunki wyprawy</h2></div><button type="button" className="cm-icon-button" aria-label="Zamknij meldunki" onClick={() => setReportsOpen(false)}><CampaignMapIcon kind="close"/></button></header><div className="cm-panel-scroll"><p>Niedźwiedzie wykonują 1 strategiczne działanie dopiero po zakończeniu Twojej tury. Neutralny punkt wymaga od nich 2 kolejnych presji, zanim zostanie zajęty. Ty masz 1 ruch po trasie i 2 działania na misje, budowę lub garnizon. Budowa wieży utrwala zdobycie terenu; załoga zwiększa obronę.</p><div className="cm-report-counts"><span>{owned} Twoich wież</span><span>{enemyCount} czerwonych punktów</span></div>{[...campaign.reports].reverse().map(r => <article key={r.id}><small>TURA {r.turn}{r.mission > 0 ? ` · PUNKT ${two(r.mission)}` : ""}</small><p>{r.text}</p></article>)}{!campaign.reports.length && <p>Pierwszy meldunek pojawi się po zakończeniu tury albo postawieniu wieży.</p>}<button type="button" className="cm-secondary" onClick={downloadBackup}>Zapisz kopię postępu do pliku</button></div></section></div>}

      {inventoryTab && <div className="cm-inventory-host"><InventoryPanel initialTab={inventoryTab} items={items} equipment={equipment} rpgState={{ ...rpg, crowns: progress.crowns }} pepeClass={progress.polishPepe.specialization} upgradeHints={hints} seenSceneIds={seenNotes} scenes={journalScenes} onClose={() => setInventoryTab(null)} onEnterMonastery={() => { setInventoryTab(null); (onEnterMonastery ?? onBack)(); }} onEquip={(item: EquipmentItem) => { setRpg(equipItem({ ...rpg, crowns: progress.crowns }, item, progress.polishPepe.specialization)); }} onUnequip={(slot: EquipmentSlot) => { setRpg(unequipSlot({ ...rpg, crowns: progress.crowns }, slot)); }}/></div>}
      {challengeOpen && activeAttempt && activeAttempt.kind !== "battle" && <CampaignMissionPuzzle key={activeAttempt.id} seed={activeAttempt.seed} kind={activeAttempt.kind} title={activeAttempt.purpose === "supplies" ? "Odnajdź skrytkę z zapasami" : attemptMission?.tasks.find(t => t.id === activeAttempt.taskId)?.title ?? "Zadanie terenowe"} onComplete={() => void finishChallenge()} onClose={closeChallenge}/>}
      {storyScene && <StorySceneModal scene={storyScene} onComplete={completeStoryScene} />}
    </>}
    {fatalError && <div className="cm-overlay cm-fatal" role="alertdialog" aria-modal="true" aria-label="Błąd zapisu"><section className="cm-reports"><h2>Operacja została zatrzymana</h2><p>{fatalError}</p><p>Nie resetuj gry. Zapis nie jest automatycznie kasowany.</p><button type="button" className="cm-primary" onClick={downloadBackup}>Pobierz kopię zapisów</button><button type="button" className="cm-secondary" onClick={onBack}>Powrót</button></section></div>}
  </main>;
  return createPortal(body, document.body);
}
