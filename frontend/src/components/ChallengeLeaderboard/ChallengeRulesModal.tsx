import { useState } from "react";

type Props = { onClose: () => void };

const RulesEn = () => <div className="challenge-rules-copy">
  <h2>PLPE MONTHLY TRADING CHALLENGE — PHASE #03</h2>
  <p><b>Period:</b> September 26, 2026 00:00 UTC — October 25, 2026 23:59 UTC</p>
  <p><b>Total rewards: $200.</b> Main Challenge: $75 / $45 / $30. Holder Bonus: $25 / $15 / $10.</p>
  <h3>Registration</h3><p>Participation requires wallet registration in PLPE OS. Connect the wallet, request registration and sign the verification message. Signing is free, does not move funds and does not approve token spending. Only eligible activity at or after the recorded registration time counts.</p>
  <h3>One participant — one wallet</h3><p>Each participant may use one registered private wallet per Phase. Multiple participating wallets used to bypass limits or obtain multiple ranking positions are prohibited. A transfer between wallets alone is not proof of common ownership.</p>
  <h3>ENTRY</h3><p>BUY ≥ $5 = 1 ENTRY. BUY &lt; $5 = 0 ENTRY. SELL = 0 ENTRY. Maximum 8 ENTRY per wallet. One qualifying BUY can create only one ENTRY regardless of size.</p>
  <h3>Main ranking</h3><p><b>ENTRY → NET BUY → TRADES → WALLET.</b> NET BUY = BUY volume − SELL volume. Selling does not remove earned ENTRY, but reduces NET BUY.</p>
  <h3>Holder Bonus</h3><p>A separate $50 Holder Bonus is available to registered wallets with at least 4 ENTRY. Ranking: HOLD % → retained qualifying PLPE → NET BUY → wallet. HOLD % compares qualifying PLPE bought during the Phase with the amount retained. The calculation uses the wallet's real PLPE balance so transfers out can reduce HOLD. Existing pre-Challenge holdings do not create extra qualifying purchases.</p>
  <h3>PLPE operational wallets</h3><p>Official Team, Marketing, Treasury, Liquidity, Rewards and other designated operational wallets are excluded from Challenge prizes. They may still perform normal project operations and distribute prizes.</p>
  <h3>Team members</h3><p>Developers, organizers and team members may participate using one registered private wallet under exactly the same automatic rules as everyone else. Operational wallets remain excluded.</p>
  <h3>Verification & reports</h3><p>ENTRY, NET BUY, trades and rankings are calculated automatically from verified data. Reports may be reviewed using blockchain and PLPE OS data. No wallet is disqualified solely because another participant alleges common ownership or because two wallets transacted with each other.</p>
  <h3>Rule stability</h3><p>Rules are not changed retroactively to alter legitimately earned results. Technical corrections may be made only to make PLPE OS calculate the published rules correctly.</p>
</div>;
const RulesPl = () => <div className="challenge-rules-copy">
  <h2>PLPE MONTHLY TRADING CHALLENGE — FAZA #03</h2>
  <p><b>Okres:</b> 26.09.2026 00:00 UTC — 25.10.2026 23:59 UTC</p>
  <p><b>Łączne nagrody: $200.</b> Główny Challenge: $75 / $45 / $30. Holder Bonus: $25 / $15 / $10.</p>
  <h3>Rejestracja</h3><p>Udział wymaga rejestracji portfela w PLPE OS. Połącz portfel, rozpocznij rejestrację i podpisz wiadomość weryfikacyjną. Podpis jest bezpłatny, nie przenosi środków i nie daje zgody na wydawanie tokenów. Liczy się wyłącznie kwalifikowana aktywność od momentu zapisanej rejestracji.</p>
  <h3>Jeden uczestnik — jeden portfel</h3><p>Każdy uczestnik może używać jednego zarejestrowanego prywatnego portfela w danej fazie. Używanie wielu portfeli w celu obejścia limitów lub zdobycia wielu miejsc w rankingu jest zabronione. Sam transfer między portfelami nie jest dowodem wspólnego właściciela.</p>
  <h3>ENTRY</h3><p>BUY ≥ $5 = 1 ENTRY. BUY &lt; $5 = 0 ENTRY. SELL = 0 ENTRY. Maksymalnie 8 ENTRY na portfel. Jeden kwalifikowany BUY daje maksymalnie jedno ENTRY niezależnie od kwoty.</p>
  <h3>Ranking główny</h3><p><b>ENTRY → NET BUY → TRADES → WALLET.</b> NET BUY = wolumen BUY − wolumen SELL. Sprzedaż nie odbiera zdobytych ENTRY, ale zmniejsza NET BUY.</p>
  <h3>Holder Bonus</h3><p>Osobna pula $50 jest dostępna dla zarejestrowanych portfeli z minimum 4 ENTRY. Ranking: HOLD % → utrzymane kwalifikowane PLPE → NET BUY → wallet. HOLD % porównuje PLPE kupione w fazie z ilością utrzymaną. System uwzględnia rzeczywiste saldo PLPE, więc transfer tokenów poza portfel może obniżyć HOLD. Tokeny posiadane przed Challenge nie tworzą dodatkowych kwalifikowanych zakupów.</p>
  <h3>Portfele operacyjne PLPE</h3><p>Oficjalne portfele Team, Marketing, Treasury, Liquidity, Rewards i inne oznaczone portfele operacyjne są wyłączone z nagród. Mogą normalnie wykonywać działania projektu i wypłacać nagrody.</p>
  <h3>Członkowie teamu</h3><p>Deweloperzy, organizatorzy i członkowie teamu mogą uczestniczyć jednym zarejestrowanym prywatnym portfelem na dokładnie tych samych automatycznych zasadach co pozostali. Portfele operacyjne pozostają wyłączone.</p>
  <h3>Weryfikacja i zgłoszenia</h3><p>ENTRY, NET BUY, transakcje i rankingi są obliczane automatycznie z danych zweryfikowanych przez system. Zgłoszenia mogą być analizowane na podstawie blockchaina i PLPE OS. Portfel nie zostanie zdyskwalifikowany wyłącznie dlatego, że inny uczestnik twierdzi, że dwa adresy mają jednego właściciela, ani tylko dlatego, że adresy wykonały między sobą transfer.</p>
  <h3>Stabilność zasad</h3><p>Zasady nie będą zmieniane wstecz w sposób zmieniający prawidłowo zdobyte wyniki. Poprawki techniczne mogą być wykonywane wyłącznie po to, aby PLPE OS prawidłowo realizował opublikowane zasady.</p>
</div>;

export default function ChallengeRulesModal({ onClose }: Props) {
  const [lang, setLang] = useState<"en"|"pl">("en");
  return <div className="challenge-modal-backdrop" onMouseDown={onClose}>
    <div className="challenge-rules-modal" onMouseDown={(e) => e.stopPropagation()}>
      <div className="challenge-rules-top"><div className="challenge-rules-tabs"><button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>🇬🇧 English</button><button className={lang === "pl" ? "active" : ""} onClick={() => setLang("pl")}>🇵🇱 Polski</button></div><button className="challenge-rules-close" onClick={onClose}>×</button></div>
      {lang === "en" ? <RulesEn /> : <RulesPl />}
    </div>
  </div>;
}
