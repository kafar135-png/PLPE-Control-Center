import { useState } from "react";
import "./BuildingHubShared.css";
import vaultBg from "../../assets/game/plpe_vault_hub_bg.png";
import {
  awardGlobalReward,
  canAfford,
  formatCost,
  getBuildingUpgradeCost,
  spendGlobalResources,
  upgradeGlobalBuilding,
  useGameProgress,
} from "./Progress";

interface Props {
  vaultLevel: number;
  memeEnergy: number;
  relics: number;
  intel: number;
  bearFragments: number;
  onBack: () => void;
}

type ExchangeNotice = {
  kind: "success" | "error";
  text: string;
} | null;

export default function VaultHub({ onBack }: Props) {
  const { progress } = useGameProgress();
  const [tab, setTab] = useState<"resources" | "relics" | "exchange">("resources");
  const [notice, setNotice] = useState<ExchangeNotice>(null);
  const lv = progress.buildings.plpeVault;
  const cost = getBuildingUpgradeCost("plpeVault", lv);

  function exchange(kind: "bear" | "intel") {
    setNotice(null);

    if (kind === "bear") {
      if (!spendGlobalResources({ bearFragments: 3 })) {
        setNotice({ kind: "error", text: "Brakuje Bear Fragments do tej wymiany." });
        return;
      }
      awardGlobalReward({ crowns: 45 });
      setNotice({
        kind: "success",
        text: `Wymieniono 3 Bear Fragments na 45 PLPEków. Stan po wymianie: ${Math.max(0, progress.bearFragments - 3)} fragmentów · ${progress.crowns + 45} PLPEków.`,
      });
      return;
    }

    if (!spendGlobalResources({ intel: 2 })) {
      setNotice({ kind: "error", text: "Brakuje Intel do tej wymiany." });
      return;
    }
    awardGlobalReward({ memeEnergy: 35 });
    setNotice({
      kind: "success",
      text: `Wymieniono 2 Intel na 35 Meme Energy. Stan po wymianie: ${Math.max(0, progress.intel - 2)} Intel · ${progress.memeEnergy + 35} Energy.`,
    });
  }

  return (
    <main className="building-hub" style={{ backgroundImage: `url(${vaultBg})` }}>
      <header className="building-hub__top">
        <div>
          <div className="building-hub__eyebrow">SKARBIEC PLPE · LV {lv}</div>
          <h1 className="building-hub__title">Zasoby, relikty i skrytka</h1>
        </div>
        <button className="building-hub__back" onClick={onBack}>← WRÓĆ DO HUBU</button>
      </header>

      <section className="building-hub__content">
        <div className="building-split">
          <div className="building-tabs">
            <button className={`building-tab ${tab === "resources" ? "active" : ""}`} onClick={() => { setTab("resources"); setNotice(null); }}>ZASOBY</button>
            <button className={`building-tab ${tab === "relics" ? "active" : ""}`} onClick={() => { setTab("relics"); setNotice(null); }}>RELIKTY</button>
            <button className={`building-tab ${tab === "exchange" ? "active" : ""}`} onClick={() => setTab("exchange")}>WYMIANA</button>
          </div>

          <div className="building-panel">
            <h3>Ulepsz Skarbiec</h3>
            <div className="building-cost"><strong>WYMAGANE:</strong> {formatCost(cost)}</div>
            <button
              className="building-action"
              disabled={!cost || !canAfford(progress, cost)}
              onClick={() => upgradeGlobalBuilding("plpeVault")}
            >
              {!cost ? "MAX" : canAfford(progress, cost) ? "ULEPSZ SKARBIEC" : "BRAK ZASOBÓW"}
            </button>
          </div>
        </div>

        {tab === "resources" && (
          <div className="building-hub__grid">
            {[
              ["⚡", "Meme Energy", progress.memeEnergy],
              ["💎", "Relikty", progress.relics],
              ["✦", "Intel", progress.intel],
              ["🐻", "Bear Fragments", progress.bearFragments],
              ["📜", "Comic Fragments", progress.comicFragments],
              ["🃏", "Card Fragments", progress.cardFragments],
              ["🪙", "PLPEkówy", progress.crowns],
            ].map(([i, n, v]) => (
              <article className="building-card ready" key={String(n)}>
                <div className="building-card__icon">{i}</div>
                <h3>{n}</h3>
                <p className="building-hub__title">{v}</p>
              </article>
            ))}
          </div>
        )}

        {tab === "relics" && (
          <div className="building-hub__grid">
            <article className="building-card ready">
              <div className="building-card__icon">💎</div>
              <h3>Relikty pospolite</h3>
              <p>Materiał do rozwoju budynków i kart mocy.</p>
              <span className="building-chip">{progress.relics} szt.</span>
            </article>
            <article className={`building-card ${progress.comicFragments > 0 ? "ready" : "locked"}`}>
              <div className="building-card__icon">📜</div>
              <h3>Fragmenty pamięci</h3>
              <p>Otwierają zapiski i receptury powiązane z komiksem.</p>
              <span className="building-chip">{progress.comicFragments} szt.</span>
            </article>
            <article className={`building-card ${progress.cardFragments > 0 ? "ready" : "locked"}`}>
              <div className="building-card__icon">🃏</div>
              <h3>Fragmenty kart</h3>
              <p>Kluczowy materiał Kuźni Mocy.</p>
              <span className="building-chip">{progress.cardFragments} szt.</span>
            </article>
          </div>
        )}

        {tab === "exchange" && (
          <>
            <div className="building-panel" style={{ marginBottom: 14 }}>
              <h3>Stan zasobów</h3>
              <div className="building-card__meta">
                <span className="building-chip">🐻 {progress.bearFragments} Bear Fragments</span>
                <span className="building-chip">✦ {progress.intel} Intel</span>
                <span className="building-chip">⚡ {progress.memeEnergy} Energy</span>
                <span className="building-chip">🪙 {progress.crowns} PLPEków</span>
              </div>
              {notice && (
                <div className={`building-exchange-notice building-exchange-notice--${notice.kind}`} role="status">
                  {notice.kind === "success" ? "✓ " : "⚠ "}{notice.text}
                </div>
              )}
            </div>

            <div className="building-hub__grid">
              <article className={`building-card ${progress.bearFragments >= 3 ? "ready" : "locked"}`}>
                <h3>3 Bear Fragments → 45 PLPEków</h3>
                <p>Wymiana trofeów zdobytych z Bear Army.</p>
                <div className="building-card__meta">
                  <span className="building-chip">Masz: {progress.bearFragments}</span>
                  <span className="building-chip">Po wymianie: {Math.max(0, progress.bearFragments - 3)}</span>
                </div>
                <button className="building-action" disabled={progress.bearFragments < 3} onClick={() => exchange("bear")}>WYMIENIAJ</button>
              </article>

              <article className={`building-card ${progress.intel >= 2 ? "ready" : "locked"}`}>
                <h3>2 Intel → 35 Energy</h3>
                <p>Przetwarzanie raportów zwiadu na zasób rozwoju.</p>
                <div className="building-card__meta">
                  <span className="building-chip">Masz: {progress.intel}</span>
                  <span className="building-chip">Po wymianie: {Math.max(0, progress.intel - 2)}</span>
                </div>
                <button className="building-action" disabled={progress.intel < 2} onClick={() => exchange("intel")}>WYMIENIAJ</button>
              </article>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
