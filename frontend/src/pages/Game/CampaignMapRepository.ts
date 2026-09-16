/** Persistence boundary. No rewards are granted on render, mount or simple node selection. */
import { loadGameProgress, saveGameProgress } from "./Progress";
import type { GameProgress } from "./Progress";
import { CAMPAIGN_VERSION, missionAt } from "./CampaignMapData";
import { normalizeCampaign, transitionCampaign, applyCampaignResources, RESOURCE_KEYS } from "./CampaignMapEngine";
import type { CampaignMapState, CampaignAction, CampaignTransition } from "./CampaignMapEngine";
export const CAMPAIGN_STORAGE_KEY = "plpe-campaign-route-v10";
export const CAMPAIGN_SYNC_EVENT = "plpe-campaign-route-v10-sync";
const JOURNAL_KEY = "plpe-campaign-route-v10-transaction";
interface PendingTransaction { version: number; campaign: CampaignMapState; progress: GameProgress; }
export function readCampaign(): CampaignMapState {
  const raw = localStorage.getItem(CAMPAIGN_STORAGE_KEY);
  if (!raw) return normalizeCampaign(null);
  try { return normalizeCampaign(JSON.parse(raw)); }
  catch { throw new Error("Zapis mapy jest nieczytelny. Nie został usunięty ani nadpisany."); }
}
function readObject(key: string): Record<string, unknown> {
  try { const value: unknown = JSON.parse(localStorage.getItem(key) ?? "{}"); return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
  catch { return {}; }
}
function stringList(value: unknown): string[] { return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []; }
export function readCampaignDiscoveries(state: CampaignMapState): { discoveries: string[]; rescuedNPCs: string[] } {
  const legacy = readObject("plpe-world-map-progress-v4");
  return { discoveries: [...new Set([...stringList(legacy.discoveries), ...state.discoveries])], rescuedNPCs: [...new Set([...stringList(legacy.rescuedNPCs), ...state.rescuedNPCs])] };
}
function mirrorLegacy(state: CampaignMapState, progress: GameProgress): void {
  // Preserve equipment, old visits, prologue, cooldowns and unrelated saves.
  const legacy = readObject("plpe-world-map-progress-v4");
  const explored = Object.entries(state.sites).filter(([, site]) => site.done.length > 0).map(([id]) => Number(id.slice(-2)));
  const visits = explored.map(n => missionAt(n)?.locationId).filter((v): v is string => !!v);
  const discovery = readCampaignDiscoveries(state);
  localStorage.setItem("plpe-world-map-progress-v4", JSON.stringify({
    ...legacy, currentLocationId: missionAt(state.current)?.locationId ?? "monastery",
    visitedLocations: [...new Set([...stringList(legacy.visitedLocations), "monastery", ...visits])],
    discoveries: discovery.discoveries, rescuedNPCs: discovery.rescuedNPCs,
    loot: Object.fromEntries(RESOURCE_KEYS.filter(k => k !== "crowns").map(k => [k, progress[k]])),
  }));
  const rpg = readObject("plpe-rpg-inventory-v1");
  localStorage.setItem("plpe-rpg-inventory-v1", JSON.stringify({ ...rpg, crowns: progress.crowns }));
}
function flushTransaction(tx: PendingTransaction): void {
  localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(tx.campaign));
  saveGameProgress(tx.progress);
  mirrorLegacy(tx.campaign, tx.progress);
  localStorage.removeItem(JOURNAL_KEY);
  window.dispatchEvent(new Event(CAMPAIGN_SYNC_EVENT));
}
export function initializeCampaign(): void {
  const raw = localStorage.getItem(JOURNAL_KEY);
  if (!raw) return;
  const tx = JSON.parse(raw) as PendingTransaction;
  if (tx.version !== CAMPAIGN_VERSION || !tx.campaign || !tx.progress) throw new Error("Nie można dokończyć zapisu mapy. Zachowaj kopię zapisów przed ponowną próbą.");
  // The journal is the exact after-state, not an award to be re-applied.
  flushTransaction(tx);
}
export async function dispatchCampaign(action: CampaignAction): Promise<CampaignTransition> {
  const run = () => {
    initializeCampaign();
    const current = readCampaign(), progress = loadGameProgress();
    const result = transitionCampaign(current, action, progress);
    if (!result.changed) return result;
    const nextProgress = applyCampaignResources(progress, result.reward, result.cost);
    const tx: PendingTransaction = { version: CAMPAIGN_VERSION, campaign: result.state, progress: nextProgress };
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(tx));
    flushTransaction(tx);
    return result;
  };
  // Supported by Chromium on localhost/HTTPS. Fallback remains synchronous per tab.
  if (typeof navigator !== "undefined" && navigator.locks) return navigator.locks.request("plpe-campaign-route-v10", run);
  return run();
}
export function exportCampaignBackup(): string {
  const keys: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("plpe-")) { const value = localStorage.getItem(key); if (value !== null) keys[key] = value; }
  }
  return JSON.stringify({ exportedAt: new Date().toISOString(), saves: keys }, null, 2);
}
