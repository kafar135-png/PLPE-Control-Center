import { useEffect, useState } from "react";
import { Download } from "lucide-react";

import { useLanguage } from "../../hooks/useLanguage";

import "./InstallAppButton.css";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;

  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

function isStandalone() {
  return (
    window.matchMedia(
      "(display-mode: standalone)"
    ).matches ||
    (window.navigator as Navigator & {
      standalone?: boolean;
    }).standalone === true
  );
}

export default function InstallAppButton() {
  const { t } = useLanguage();

  const [
    installPrompt,
    setInstallPrompt,
  ] =
    useState<BeforeInstallPromptEvent | null>(
      null
    );

  const [
    installed,
    setInstalled,
  ] =
    useState(false);

  useEffect(() => {
    setInstalled(
      isStandalone()
    );

    const handleBeforeInstallPrompt = (
      event: Event
    ) => {
      event.preventDefault();

      setInstallPrompt(
        event as BeforeInstallPromptEvent
      );
    };

    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      handleInstalled
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleInstalled
      );
    };
  }, []);

  async function handleInstall() {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();

    const result =
      await installPrompt.userChoice;

    if (
      result.outcome === "accepted"
    ) {
      setInstallPrompt(null);
    }
  }

  if (
    installed ||
    !installPrompt
  ) {
    return null;
  }

  return (
    <button
      type="button"
      className="install-app-button"
      onClick={handleInstall}
    >
      <Download
        size={17}
        strokeWidth={2.2}
      />

      <span>
        {t.common.installApp}
      </span>
    </button>
  );
}