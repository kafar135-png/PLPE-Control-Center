import "./Hero.css";
import logo from "../../assets/logo.png";
import { CircleDot } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";

function Hero() {
  const { t } = useLanguage();

  return (
    <section className="hero">
      <div className="hero-left">
        <div className="hero-badge">
          <CircleDot
            size={14}
            fill="var(--plpe-green)"
            color="var(--plpe-green)"
          />

          <span>{t.common.live}</span>
        </div>

        <h1>PLPE OS</h1>

        <h2>
          First Polish Meme Coin
          <br />
          on Ethereum
        </h2>

        <p>
          AI Powered • Community Driven • Built in Poland
        </p>
      </div>

      <div className="hero-right">
        <div className="hero-circle">
          <img
            src={logo}
            alt="PolishPepe"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;