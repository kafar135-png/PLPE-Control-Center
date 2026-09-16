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
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia(
      "(display-mode: standalone)"
    ).matches ||
    (window.navigator as Navigator & {
      standalone?: boolean;
    }).standalone === true
  );
}

function isIOS() {
  if (typeof window === "undefined") {
    return false;
  }

  return /iphone|ipad|ipod/i.test(
    navigator.userAgent
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
    /*
     * Normal PWA installation flow
     * Chrome / Edge / Android
     */

    if (installPrompt) {
      await installPrompt.prompt();

      const result =
        await installPrompt.userChoice;

      if (
        result.outcome === "accepted"
      ) {
        setInstallPrompt(null);
      }

      return;
    }

    /*
     * iPhone / iPad
     *
     * iOS does not support
     * beforeinstallprompt.
     */

    if (isIOS()) {
      window.alert(
        t.common.installAppIos
      );

      return;
    }

    /*
     * Browser has not exposed the
     * install prompt yet.
     *
     * Keep the button visible and
     * tell the user how to install.
     */

    window.alert(
      t.common.installAppManual
    );
  }

  /*
   * Hide only when the user is already
   * running PLPE OS as an installed PWA.
   */

  if (installed) {
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