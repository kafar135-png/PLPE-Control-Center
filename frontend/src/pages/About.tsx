import "./About.css";
import { PROJECT } from "../config/project";
import { useLanguage } from "../hooks/useLanguage";

function About() {
  const { t } = useLanguage();

  const copyContract = async () => {
    try {
      await navigator.clipboard.writeText(PROJECT.contract);
      alert(t.about.contractCopied);
    } catch {
      alert(t.about.copyFailed);
    }
  };

  return (
    <div className="about-page">

      <h1>🐸 {t.about.title}</h1>

      <div className="about-grid">

        <div className="about-card">

          <h2>📋 {t.about.projectInformation}</h2>

          <div className="info-row">
            <span>{t.about.version}</span>
            <strong>{PROJECT.version}</strong>
          </div>

          <div className="info-row">
            <span>{t.about.network}</span>
            <strong>{PROJECT.network}</strong>
          </div>

          <div className="info-row">
            <span>{t.about.token}</span>
            <strong>{PROJECT.ticker}</strong>
          </div>

          <div className="info-row">
            <span>{t.about.supply}</span>
            <strong>{PROJECT.supply}</strong>
          </div>

          <div className="info-row">
            <span>{t.about.status}</span>
            <strong className="online">
              {PROJECT.status}
            </strong>
          </div>

        </div>

        <div className="about-card">

          <h2>🚀 {t.about.mission}</h2>

          <p>

            {t.about.missionText1}

            <br />
            <br />

            {t.about.missionText2}

            <br />
            <br />

            {t.about.missionText3}

          </p>

        </div>

      </div>

      <div className="about-card full">

        <h2>🌍 {t.about.officialLinks}</h2>

        <div className="links-grid">

          <a
            href={PROJECT.website}
            target="_blank"
            rel="noreferrer"
          >
            🌍 {t.about.website}
          </a>

          <a
            href={PROJECT.x}
            target="_blank"
            rel="noreferrer"
          >
            ✖ {t.about.x}
          </a>

          <a
            href={PROJECT.telegram}
            target="_blank"
            rel="noreferrer"
          >
            💬 {t.about.telegram}
          </a>

          <a
            href={PROJECT.discord}
            target="_blank"
            rel="noreferrer"
          >
            🎮 {t.about.discord}
          </a>

        </div>

      </div>

      <div className="about-card full">

        <h2>📜 {t.about.smartContract}</h2>

        <div className="contract-box">

          <code>
            {PROJECT.contract}
          </code>

          <button onClick={copyContract}>
            📋 {t.about.copy}
          </button>

        </div>

      </div>

    </div>
  );
}

export default About;