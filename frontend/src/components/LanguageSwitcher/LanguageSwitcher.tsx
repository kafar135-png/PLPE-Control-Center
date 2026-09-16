import "./LanguageSwitcher.css";

import { useLanguage } from "../../hooks/useLanguage";

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-switcher">
      <span className="language-icon">🌐</span>

      <select
        className="language-select"
        value={language}
        onChange={(e) =>
          setLanguage(e.target.value as "en" | "pl")
        }
      >
        <option value="en">English</option>
        <option value="pl">Polski</option>
      </select>
    </div>
  );
}

export default LanguageSwitcher;