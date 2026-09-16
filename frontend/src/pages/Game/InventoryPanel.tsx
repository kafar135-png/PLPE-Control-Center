import {
  useEffect,
  useMemo,
  useState,
} from "react";

import "./InventoryPanel.css";

import type {
  EquipmentItem,
  EquipmentSlot,
  InventoryItem,
  RpgInventoryState,
  UpgradeHint,
} from "./GameplayInventory";

import type {
  WorldStoryScene,
} from "./WorldStory";
import { PEPE_CLASSES, type PepeClass } from "./CharacterClasses";

export type InventoryPanelTab =
  | "inventory"
  | "upgrades"
  | "journal";

interface InventoryPanelProps {
  items: InventoryItem[];

  equipment: EquipmentItem[];

  rpgState: RpgInventoryState;

  pepeClass: PepeClass | null;

  upgradeHints: UpgradeHint[];

  seenSceneIds: string[];

  scenes: WorldStoryScene[];

  initialTab?: InventoryPanelTab;

  onClose: () => void;

  onEnterMonastery: () => void;

  onEquip: (item: EquipmentItem) => void;

  onUnequip: (slot: EquipmentSlot) => void;
}


const JOURNAL_READ_KEY = "plpe-journal-read-v1";
const JOURNAL_READ_EVENT = "plpe-journal-read-v1-sync";

function loadReadSceneIds(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(JOURNAL_READ_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? [...new Set(parsed.filter((value): value is string => typeof value === "string"))]
      : [];
  } catch {
    return [];
  }
}

function saveReadSceneIds(ids: string[]) {
  localStorage.setItem(JOURNAL_READ_KEY, JSON.stringify([...new Set(ids)]));
  window.dispatchEvent(new Event(JOURNAL_READ_EVENT));
}

const SLOT_LABELS: Record<EquipmentSlot, string> = {
  head: "GŁOWA",
  body: "PANCERZ",
  gloves: "RĘKAWICE",
  boots: "BUTY",
  charm: "AMULET",
};

function statsText(item: EquipmentItem) {
  const stats: string[] = [];

  if (item.stats.attack) {
    stats.push(`ATK ${item.stats.attack > 0 ? "+" : ""}${item.stats.attack}`);
  }

  if (item.stats.defense) {
    stats.push(`DEF ${item.stats.defense > 0 ? "+" : ""}${item.stats.defense}`);
  }

  if (item.stats.speed) {
    stats.push(`SPD ${item.stats.speed > 0 ? "+" : ""}${item.stats.speed}`);
  }

  if (item.stats.maxHp) {
    stats.push(`HP ${item.stats.maxHp > 0 ? "+" : ""}${item.stats.maxHp}`);
  }

  if (item.stats.lootBonus) {
    stats.push(`LOOT +${item.stats.lootBonus}%`);
  }

  return stats.join("  •  ");
}

export default function InventoryPanel({
  items,
  equipment,
  rpgState,
  pepeClass,
  upgradeHints,
  seenSceneIds,
  scenes,
  initialTab = "inventory",
  onClose,
  onEnterMonastery,
  onEquip,
  onUnequip,
}: InventoryPanelProps) {
  const [
    tab,
    setTab,
  ] = useState<InventoryPanelTab>(
    initialTab
  );

  const [
    selectedSceneId,
    setSelectedSceneId,
  ] = useState<string | null>(
    null
  );

  const [
    readSceneIds,
    setReadSceneIds,
  ] = useState<string[]>(
    loadReadSceneIds
  );

  useEffect(() => {
    const syncReadState = () => setReadSceneIds(loadReadSceneIds());
    window.addEventListener(JOURNAL_READ_EVENT, syncReadState);
    window.addEventListener("storage", syncReadState);
    return () => {
      window.removeEventListener(JOURNAL_READ_EVENT, syncReadState);
      window.removeEventListener("storage", syncReadState);
    };
  }, []);

  useEffect(() => {
    setTab(
      initialTab
    );

    setSelectedSceneId(
      null
    );
  }, [
    initialTab,
  ]);

  const visibleScenes =
    useMemo(
      () =>
        scenes.filter(
          (
            scene
          ) =>
            seenSceneIds.includes(
              scene.id
            )
        ),
      [
        scenes,
        seenSceneIds,
      ]
    );

  const selectedScene =
    visibleScenes.find(
      (
        scene
      ) =>
        scene.id ===
        selectedSceneId
    ) ??
    null;

  const unreadSceneIds =
    visibleScenes
      .filter((scene) => !readSceneIds.includes(scene.id))
      .map((scene) => scene.id);

  function markSceneRead(sceneId: string) {
    if (readSceneIds.includes(sceneId)) return;
    const next = [...readSceneIds, sceneId];
    setReadSceneIds(next);
    saveReadSceneIds(next);
  }

  function openScene(sceneId: string) {
    markSceneRead(sceneId);
    setSelectedSceneId(sceneId);
  }

  const className = pepeClass ? PEPE_CLASSES[pepeClass].namePl : "Brak klasy";
  const compatibleWithClass = (item: EquipmentItem) =>
    !item.allowedClasses?.length || (!!pepeClass && item.allowedClasses.includes(pepeClass));

  const unlockedEquipment =
    equipment.filter(
      (
        item
      ) =>
        item.unlocked
    );

  const lockedEquipment =
    equipment.filter(
      (
        item
      ) =>
        !item.unlocked
    );


  function isEquipped(
    item: EquipmentItem
  ) {
    return (
      rpgState.equipped[
        item.slot
      ] ===
      item.id
    );
  }

  function openJournal() {
    setSelectedSceneId(
      null
    );

    setTab(
      "journal"
    );
  }

  return (
    <section className="game-inventory">
      <div className="game-inventory__panel">
        <header className="game-inventory__header">
          <div>
            <span>
              POLISHPEPE
            </span>

            <h2>
              Ekwipunek i Dziennik
            </h2>
          </div>

          <div className="game-inventory__wallet">
            <span>
              🪙 PLPEKI
            </span>

            <strong>
              {rpgState.crowns}
            </strong>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
          >
            ✕
          </button>
        </header>

        <nav className="game-inventory__tabs">
          <button
            type="button"
            className={
              tab ===
              "inventory"
                ? "active"
                : ""
            }
            onClick={() => {
              setSelectedSceneId(
                null
              );

              setTab(
                "inventory"
              );
            }}
          >
            🎒 EKWIPUNEK
          </button>

          <button
            type="button"
            className={
              tab ===
              "upgrades"
                ? "active"
                : ""
            }
            onClick={() => {
              setSelectedSceneId(
                null
              );

              setTab(
                "upgrades"
              );
            }}
          >
            ⬆ ULEPSZENIA
            {upgradeHints.length >
              0
              ? ` (${upgradeHints.length})`
              : ""}
          </button>

          <button
            type="button"
            className={
              tab ===
              "journal"
                ? "active"
                : ""
            }
            onClick={
              openJournal
            }
          >
            📖 ZAPISKI
            {unreadSceneIds.length >
              0
              ? ` (${unreadSceneIds.length})`
              : ""}
          </button>
        </nav>

        <div className="game-inventory__content">
          {tab ===
            "inventory" && (
            <>
              <section className="game-inventory__equipment-section">
                <div className="game-inventory__section-heading">
                  <div>
                    <span>
                      RPG EQUIPMENT
                    </span>

                    <h3>
                      Wyposażenie PolishPepe
                    </h3>
                  </div>

                  <small>
                    Kliknij przedmiot, aby go założyć. Aktualna klasa: {className}. Relikty klasowe działają tylko na przypisaną specjalizację.
                  </small>
                </div>

                <div className="game-inventory__equipped-slots">
                  {(
                    [
                      "head",
                      "body",
                      "gloves",
                      "boots",
                      "charm",
                    ] as EquipmentSlot[]
                  ).map(
                    (
                      slot
                    ) => {
                      const id =
                        rpgState.equipped[
                          slot
                        ];

                      const item =
                        equipment.find(
                          (
                            candidate
                          ) =>
                            candidate.id ===
                            id
                        );

                      return (
                        <article
                          key={
                            slot
                          }
                          className={`game-inventory__slot ${item ? "filled" : ""}`}
                        >
                          <span>
                            {
                              SLOT_LABELS[
                                slot
                              ]
                            }
                          </span>

                          {item ? (
                            <>
                              <strong>
                                {item.icon}{" "}
                                {item.name}
                              </strong>

                              <small>
                                {statsText(
                                  item
                                )}
                              </small>

                              <button
                                type="button"
                                onClick={() =>
                                  onUnequip(
                                    slot
                                  )
                                }
                              >
                                ZDEJMIJ
                              </button>
                            </>
                          ) : (
                            <b>
                              PUSTE
                            </b>
                          )}
                        </article>
                      );
                    }
                  )}
                </div>

                <div className="game-inventory__gear-grid">
                  {unlockedEquipment.map(
                    (
                      item
                    ) => (
                      <article
                        key={
                          item.id
                        }
                        className={`game-inventory__gear game-inventory__gear--${item.rarity} ${isEquipped(item) ? "equipped" : ""}`}
                      >
                        <div className="game-inventory__gear-icon">
                          {item.icon}
                        </div>

                        <div>
                          <span>
                            {item.rarity.toUpperCase()}{" "}
                            •{" "}
                            {SLOT_LABELS[item.slot]}
                            {item.allowedClasses?.length ? ` • ${item.allowedClasses.map(id => PEPE_CLASSES[id].namePl).join("/")}` : ""}
                          </span>

                          <strong>
                            {item.name}
                          </strong>

                          <p>
                            {item.description}
                          </p>

                          <small>
                            {statsText(
                              item
                            )}
                          </small>

                          <em>
                            Źródło:{" "}
                            {item.source}
                          </em>
                        </div>

                        <button
                          type="button"
                          disabled={isEquipped(item) || !compatibleWithClass(item)}
                          onClick={() => onEquip(item)}
                        >
                          {isEquipped(item)
                            ? "ZAŁOŻONE"
                            : compatibleWithClass(item)
                              ? "ZAŁÓŻ"
                              : `TYLKO ${item.allowedClasses?.map(id => PEPE_CLASSES[id].namePl.toUpperCase()).join("/")}`}
                        </button>
                      </article>
                    )
                  )}
                </div>

                {lockedEquipment.length >
                  0 && (
                  <details className="game-inventory__locked-gear">
                    <summary>
                      🔒 Nieodkryte wyposażenie ({lockedEquipment.length})
                    </summary>

                    <div>
                      {lockedEquipment.map(
                        (
                          item
                        ) => (
                          <span
                            key={
                              item.id
                            }
                          >
                            ????????? — odkryj podczas eksploracji
                          </span>
                        )
                      )}
                    </div>
                  </details>
                )}
              </section>

              <section className="game-inventory__bag-section">
                <div className="game-inventory__section-heading">
                  <div>
                    <span>
                      PLECAK
                    </span>

                    <h3>
                      Zasoby, artefakty i klucze
                    </h3>
                  </div>
                </div>

                <div className="game-inventory__grid">
                  {items.map(
                    (
                      item
                    ) => (
                      <article
                        key={
                          item.id
                        }
                        className={`game-inventory__item game-inventory__item--${item.kind}`}
                      >
                        <div className="game-inventory__item-icon">
                          {item.icon}
                        </div>

                        <div className="game-inventory__item-copy">
                          <strong>
                            {item.name}
                          </strong>

                          <p>
                            {item.description}
                          </p>

                          {item.source && (
                            <small>
                              Źródło:{" "}
                              {item.source}
                            </small>
                          )}
                        </div>

                        <b>
                          {item.quantity}
                        </b>
                      </article>
                    )
                  )}
                </div>
              </section>
            </>
          )}

          {tab ===
            "upgrades" && (
            <div className="game-inventory__upgrades">
              {upgradeHints.length ===
              0 ? (
                <div className="game-inventory__empty">
                  Na razie nie masz kompletu materiałów na nowe ulepszenie.
                </div>
              ) : (
                <>
                  <div className="game-inventory__ready-banner">
                    <strong>
                      Masz gotowe możliwości rozwoju.
                    </strong>

                    <span>
                      Karty poniżej pokazują dokładnie, który budynek w Klasztorze ma coś gotowego. Po wejściu do bazy szukaj podświetlonego budynku.
                    </span>
                  </div>

                  <div className="game-inventory__upgrade-list">
                    {upgradeHints.map(
                      (
                        hint
                      ) => (
                        <article
                          key={
                            hint.id
                          }
                          className="game-inventory__upgrade-card ready"
                        >
                          <div className="game-inventory__upgrade-pulse">
                            !
                          </div>

                          <span>
                            GOTOWE • {hint.building}
                          </span>

                          <strong>
                            {hint.title}
                          </strong>

                          <p>
                            {hint.description}
                          </p>

                          <button
                            type="button"
                            onClick={
                              onEnterMonastery
                            }
                          >
                            🏰 IDŹ DO KLASZTORU
                          </button>
                        </article>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    className="game-inventory__monastery"
                    onClick={
                      onEnterMonastery
                    }
                  >
                    🏰 IDŹ DO KLASZTORU
                  </button>
                </>
              )}
            </div>
          )}

          {tab ===
            "journal" && (
            <div className="game-inventory__journal">
              {selectedScene ? (
                <article className="game-inventory__journal-reader">
                  <button
                    type="button"
                    className="game-inventory__journal-back"
                    onClick={() =>
                      setSelectedSceneId(
                        null
                      )
                    }
                  >
                    ← WSZYSTKIE ZAPISKI
                  </button>

                  <header>
                    <span>
                      {selectedScene.speaker}
                    </span>

                    <h3>
                      {selectedScene.title}
                    </h3>
                  </header>

                  <div className="game-inventory__journal-pages">
                    {selectedScene.text.map(
                      (
                        paragraph,
                        index
                      ) => (
                        <p
                          key={`${selectedScene.id}-${index}`}
                        >
                          {paragraph}
                        </p>
                      )
                    )}
                  </div>

                  <div className="game-inventory__journal-note">
                    <span>
                      ZAPIS W DZIENNIKU
                    </span>

                    <p>
                      {selectedScene.note}
                    </p>
                  </div>
                </article>
              ) : visibleScenes.length ===
                0 ? (
                  <div className="game-inventory__empty">
                    Nie odblokowałeś jeszcze żadnych zapisków fabularnych.
                  </div>
                ) : (
                  <div className="game-inventory__journal-list">
                    {visibleScenes.map(
                      (
                        scene,
                        index
                      ) => (
                        <button
                          key={
                            scene.id
                          }
                          type="button"
                          className={`game-inventory__journal-card ${readSceneIds.includes(scene.id) ? "read" : "unread"}`}
                          onClick={() => openScene(scene.id)}
                        >
                          <div className="game-inventory__journal-number">
                            {String(
                              index +
                                1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </div>

                          <div>
                            <span>
                              {scene.speaker}
                            </span>

                            <strong>
                              {scene.title}
                            </strong>

                            <p>
                              {scene.note}
                            </p>

                            <small>
                              {readSceneIds.includes(scene.id)
                                ? "✓ PRZECZYTANE"
                                : "● NOWY — KLIKNIJ, ABY PRZECZYTAĆ"}
                            </small>
                          </div>

                          <b>
                            ›
                          </b>
                        </button>
                      )
                    )}
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
