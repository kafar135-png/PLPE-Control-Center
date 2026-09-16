import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";
import "./WalletSearch.css";

function isValidAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

export default function WalletSearch() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [searchParams] = useSearchParams();

  const [wallet, setWallet] = useState(
    searchParams.get("address") ?? ""
  );

  const [error, setError] = useState("");

  useEffect(() => {
    setWallet(searchParams.get("address") ?? "");
  }, [searchParams]);

  function analyze() {
    const value = wallet.trim();

    if (!value) {
      navigate("/holder");
      return;
    }

    if (!isValidAddress(value)) {
      setError(t.holderProfile.invalidWallet);
      return;
    }

    setError("");

    navigate(`/holder?address=${value}`);
  }

  function clear() {
    setWallet("");
    setError("");
    navigate("/holder");
  }

  return (
    <div className="wallet-search">

      <div className="wallet-search-header">
        <h2> {t.holderProfile.searchWallet}</h2>
      </div>

      <div className="wallet-search-row">

        <input
        className="input"
          type="text"
          placeholder={t.holderProfile.walletPlaceholder}
          value={wallet}
          onChange={(e) => {
            setWallet(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              analyze();
            }
          }}
        />

        <button onClick={analyze}>
          🔎 {t.holderProfile.analyze}
        </button>

        <button
          className="secondary"
          onClick={clear}
        >
          👤 {t.holderProfile.myWallet}
        </button>

      </div>

      {error && (
        <div className="wallet-search-error">
          {error}
        </div>
      )}

    </div>
  );
}
