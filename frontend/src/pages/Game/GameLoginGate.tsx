import { useEffect, useMemo, useState } from "react";

import "./GameLoginGate.css";

import scene2MountainPath from "../../assets/game/scene2_mountain_path_bg.png";

import { useLanguage } from "../../hooks/useLanguage";
import { useWallet } from "../../hooks/useWallet";
import {
  clearGameAuth,
  getGameAuthToken,
  getGameProfile,
  loginGameAccount,
  registerGameAccount,
  sendGamePresenceHeartbeat,
  shortWallet,
} from "../../services/gameMultiplayer";
import type { GamePlayerProfile } from "../../services/gameMultiplayer";

interface GameLoginGateProps {
  onAuthenticated: (player: GamePlayerProfile) => void;
  onBack: () => void;
}

type AuthMode = "login" | "register";

export default function GameLoginGate({
  onAuthenticated,
  onBack,
}: GameLoginGateProps) {
  const { language } = useLanguage();
  const polish = language === "pl";
  const { address, isConnected } = useWallet();

  const [mode, setMode] = useState<AuthMode>("login");
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [profile, setProfile] = useState<GamePlayerProfile | null>(null);
  const [checkingSession, setCheckingSession] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const copy = useMemo(
    () =>
      polish
        ? {
            eyebrow: "POLISHPEPE UNIVERSE · KONTO GRACZA",
            title: "PLPE Game",
            text: "Zaloguj się nickiem lub e-mailem. Portfel z PLPE OS służy tylko do powiązania konta z ekosystemem, nagrodami i statusem holdera.",
            loginTab: "LOGOWANIE",
            registerTab: "REJESTRACJA",
            loginLabel: "Nick lub e-mail",
            emailLabel: "E-mail",
            nicknameLabel: "Nick gracza",
            passwordLabel: "Hasło",
            repeatPasswordLabel: "Powtórz hasło",
            loginButton: "ZALOGUJ SIĘ",
            registerButton: "UTWÓRZ KONTO",
            busy: "PROSZĘ CZEKAĆ...",
            linkedWallet: "Portfel PLPE OS",
            walletMissing:
              "Aby utworzyć konto, najpierw połącz portfel w PLPE OS. Do późniejszego logowania portfel nie będzie wymagany.",
            sessionReady: "SESJA GRACZA GOTOWA",
            continue: "KONTYNUUJ",
            checking: "SPRAWDZANIE SESJI...",
            back: "← WRÓĆ",
            level: "Poziom",
            rating: "Rating",
            passwordMismatch: "Hasła nie są identyczne.",
          }
        : {
            eyebrow: "POLISHPEPE UNIVERSE · PLAYER ACCOUNT",
            title: "PLPE Game",
            text: "Log in with your nickname or email. Your PLPE OS wallet is only used to link the account with the ecosystem, rewards and holder status.",
            loginTab: "LOGIN",
            registerTab: "REGISTER",
            loginLabel: "Nickname or email",
            emailLabel: "Email",
            nicknameLabel: "Player nickname",
            passwordLabel: "Password",
            repeatPasswordLabel: "Repeat password",
            loginButton: "LOGIN",
            registerButton: "CREATE ACCOUNT",
            busy: "PLEASE WAIT...",
            linkedWallet: "PLPE OS wallet",
            walletMissing:
              "Connect a wallet in PLPE OS before creating an account. The wallet will not be required for later logins.",
            sessionReady: "PLAYER SESSION READY",
            continue: "CONTINUE",
            checking: "CHECKING SESSION...",
            back: "← BACK",
            level: "Level",
            rating: "Rating",
            passwordMismatch: "Passwords do not match.",
          },
    [polish]
  );

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      setError("");
      setProfile(null);

      if (!getGameAuthToken()) {
        setCheckingSession(false);
        return;
      }

      setCheckingSession(true);

      try {
        const restored = await getGameProfile();
        await sendGamePresenceHeartbeat("online");

        if (!cancelled) {
          setProfile(restored);
        }
      } catch (cause) {
        clearGameAuth();

        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Game session error");
        }
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogin() {
    if (!login.trim() || !password) return;

    setBusy(true);
    setError("");

    try {
      const result = await loginGameAccount(login.trim(), password);
      await sendGamePresenceHeartbeat("online");
      setProfile(result.player);
      onAuthenticated(result.player);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Game login failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister() {
    if (!email.trim() || !nickname.trim() || !password) return;

    if (password !== passwordRepeat) {
      setError(copy.passwordMismatch);
      return;
    }

    if (!isConnected || !address) {
      setError(copy.walletMissing);
      return;
    }

    setBusy(true);
    setError("");

    try {
      const result = await registerGameAccount(
        email.trim(),
        nickname.trim(),
        password,
        address
      );
      await sendGamePresenceHeartbeat("online");
      setProfile(result.player);
      onAuthenticated(result.player);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      className="plpe-login-gate"
      style={{
        backgroundImage: `linear-gradient(rgba(2, 6, 11, 0.48), rgba(2, 6, 11, 0.84)), url(${scene2MountainPath})`,
      }}
    >
      <section className="plpe-login-gate__panel">
        <span className="plpe-login-gate__eyebrow">{copy.eyebrow}</span>
        <h1>{copy.title}</h1>
        <p>{copy.text}</p>

        {checkingSession ? (
          <div className="plpe-login-gate__status">{copy.checking}</div>
        ) : profile ? (
          <div className="plpe-login-gate__profile">
            <span>{copy.sessionReady}</span>
            <strong>{profile.nickname || "PLPE Player"}</strong>
            <small>{shortWallet(profile.walletAddress)}</small>

            <div className="plpe-login-gate__stats">
              <div>
                <span>{copy.level}</span>
                <b>{profile.level}</b>
              </div>
              <div>
                <span>{copy.rating}</span>
                <b>{profile.rating}</b>
              </div>
            </div>

            <button
              type="button"
              className="plpe-login-gate__primary"
              onClick={() => onAuthenticated(profile)}
            >
              {copy.continue}
            </button>
          </div>
        ) : (
          <>
            <div className="plpe-login-gate__tabs">
              <button
                type="button"
                className={mode === "login" ? "active" : ""}
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
              >
                {copy.loginTab}
              </button>
              <button
                type="button"
                className={mode === "register" ? "active" : ""}
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
              >
                {copy.registerTab}
              </button>
            </div>

            {mode === "login" ? (
              <form
                className="plpe-login-gate__form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleLogin();
                }}
              >
                <label>
                  <span>{copy.loginLabel}</span>
                  <input
                    autoComplete="username"
                    value={login}
                    onChange={(event) => setLogin(event.target.value)}
                    placeholder="PolishPepe / pepe@example.com"
                  />
                </label>
                <label>
                  <span>{copy.passwordLabel}</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                  />
                </label>
                <button
                  type="submit"
                  className="plpe-login-gate__primary"
                  disabled={busy || !login.trim() || password.length < 8}
                >
                  {busy ? copy.busy : copy.loginButton}
                </button>
              </form>
            ) : (
              <form
                className="plpe-login-gate__form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleRegister();
                }}
              >
                <label>
                  <span>{copy.emailLabel}</span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="pepe@example.com"
                  />
                </label>
                <label>
                  <span>{copy.nicknameLabel}</span>
                  <input
                    autoComplete="nickname"
                    maxLength={20}
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                    placeholder="PolishPepe"
                  />
                </label>
                <div className="plpe-login-gate__two-columns">
                  <label>
                    <span>{copy.passwordLabel}</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                    />
                  </label>
                  <label>
                    <span>{copy.repeatPasswordLabel}</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={passwordRepeat}
                      onChange={(event) => setPasswordRepeat(event.target.value)}
                      placeholder="••••••••"
                    />
                  </label>
                </div>

                <div className={`plpe-login-gate__wallet-link ${isConnected && address ? "ok" : "missing"}`}>
                  <span>{copy.linkedWallet}</span>
                  <strong>
                    {isConnected && address ? shortWallet(address) : copy.walletMissing}
                  </strong>
                </div>

                <button
                  type="submit"
                  className="plpe-login-gate__primary"
                  disabled={
                    busy ||
                    !isConnected ||
                    !address ||
                    !email.trim() ||
                    nickname.trim().length < 3 ||
                    password.length < 8 ||
                    password !== passwordRepeat
                  }
                >
                  {busy ? copy.busy : copy.registerButton}
                </button>
              </form>
            )}
          </>
        )}

        {error ? <div className="plpe-login-gate__error">{error}</div> : null}

        <button
          type="button"
          className="plpe-login-gate__back"
          onClick={onBack}
        >
          {copy.back}
        </button>
      </section>
    </main>
  );
}
