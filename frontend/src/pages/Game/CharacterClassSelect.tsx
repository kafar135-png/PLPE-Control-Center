import { useMemo, useState } from "react";
import "./CharacterClassSelect.css";
import scene2MountainPath from "../../assets/game/scene2_mountain_path_bg.png";
import warriorArt from "../../assets/game/char_polishpepe_warrior.png";
import rangerArt from "../../assets/game/char_polishpepe_ranger.png";
import mageArt from "../../assets/game/char_polishpepe_mage.png";
import { useLanguage } from "../../hooks/useLanguage";
import { PEPE_CLASSES, type PepeClass } from "./CharacterClasses";

interface Props {
  onSelect: (pepeClass: PepeClass) => void | Promise<void>;
}

export default function CharacterClassSelect({ onSelect }: Props) {
  const { language } = useLanguage();
  const polish = language === "pl";
  const [selected, setSelected] = useState<PepeClass>("warrior");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const current = PEPE_CLASSES[selected];
  const classArt = { warrior: warriorArt, ranger: rangerArt, mage: mageArt } as const;
  const copy = useMemo(() => polish ? {
    eyebrow: "POLISHPEPE UNIVERSE · SPECJALIZACJA",
    title: "Wybierz swoją drogę",
    text: "Każdy gracz rozwija własnego PolishPepe. Wybór zmienia statystyki, ataki, umiejętności i styl walki na Arenie.",
    confirm: "WYBIERAM TĘ KLASĘ",
    note: "Klasa jest przypisana do tej postaci. Rozwijasz ją przez całą grę.",
    hp: "HP", attack: "ATK", defense: "DEF", speed: "SPD", start: "START", role: "ROLA",
  } : {
    eyebrow: "POLISHPEPE UNIVERSE · SPECIALIZATION",
    title: "Choose your path",
    text: "Every player develops their own PolishPepe. Your choice changes stats, attacks, abilities and Arena playstyle.",
    confirm: "CHOOSE THIS CLASS",
    note: "This class belongs to your character and grows with you through the game.",
    hp: "HP", attack: "ATK", defense: "DEF", speed: "SPD", start: "START", role: "ROLE",
  }, [polish]);

  return <main className="pepe-class-select" style={{ backgroundImage: `linear-gradient(rgba(2,6,11,.45), rgba(2,6,11,.86)), url(${scene2MountainPath})` }}>
    <section className="pepe-class-select__panel">
      <span className="pepe-class-select__eyebrow">{copy.eyebrow}</span>
      <h1>{copy.title}</h1>
      <p className="pepe-class-select__lead">{copy.text}</p>
      <div className="pepe-class-select__grid">
        {(Object.keys(PEPE_CLASSES) as PepeClass[]).map((id) => {
          const item = PEPE_CLASSES[id];
          const active = selected === id;
          return <button key={id} type="button" className={`pepe-class-card ${active ? "active" : ""}`} onClick={() => setSelected(id)}>
            <div className={`pepe-class-card__portrait pepe-class-card__portrait--${id}`}>
              <img src={classArt[id]} alt={`PolishPepe — ${polish ? item.namePl : item.nameEn}`} />
              <span>{item.icon}</span>
            </div>
            <strong>{polish ? item.namePl : item.nameEn}</strong>
            <small>{polish ? item.taglinePl : item.taglineEn}</small>
            <div className="pepe-class-card__mods">
              <b>{copy.hp} {item.startingStats.hp}</b>
              <b>{copy.attack} {item.startingStats.attack}</b>
              <b>{copy.defense} {item.startingStats.defense}</b>
              <b>{copy.speed} {item.startingStats.speed}</b>
            </div>
            <em className="pepe-class-card__role">{copy.role}: {polish ? item.rolePl : item.roleEn}</em>
          </button>;
        })}
      </div>
      <div className="pepe-class-select__details">
        <div><span className="pepe-class-select__big-icon">{current.icon}</span><div><strong>{polish ? current.namePl : current.nameEn}</strong><p>{polish ? current.taglinePl : current.taglineEn}</p></div></div>
        <div className="pepe-class-select__skills">
          {current.skills.map(skill => <article key={skill.nameEn}><span>{skill.icon}</span><div><b>LV {skill.level} · {polish ? skill.namePl : skill.nameEn}</b><small>{polish ? skill.descPl : skill.descEn}</small></div></article>)}
        </div>
      </div>
      <p className="pepe-class-select__note">{copy.note}</p>
      {error && <div className="pepe-class-select__error">{error}</div>}
      <button className="pepe-class-select__confirm" type="button" disabled={busy} onClick={async () => { setBusy(true); setError(""); try { await onSelect(selected); } catch (cause) { setError(cause instanceof Error ? cause.message : "Nie udało się zapisać klasy."); } finally { setBusy(false); } }}>{busy ? "ZAPISYWANIE..." : copy.confirm}</button>
    </section>
  </main>;
}
