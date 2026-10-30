"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, Share, MonitorDown } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallPage({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    setIsInstalled(standalone);
    setIsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      onContinue();
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [onContinue]);

  const handleInstall = async () => {
    if (!installPrompt) return;

    try {
      setInstalling(true);
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      if (choice.outcome === "accepted") {
        // Суулгасны дараа аппыг нээхэд standalone горимоор ажиллана.
        onContinue();
      }
    } catch (error) {
      console.error("PWA суулгах хүсэлт амжилтгүй:", error);
    } finally {
      setInstalling(false);
    }
  };

  if (isInstalled) {
    return null;
  }

  return (
    <main className="app-shell">
      <section className="phone-frame">
        <div className="login-page">
          <div className="brand">
            <div className="brand-icon">
              <img src="/icon.svg" alt="Сургуулийн лого" className="school-logo" />
            </div>
            <h1>Сурагчийн ирц</h1>
            <p>Сургуулийн ирцийн бүртгэлийн систем</p>
          </div>

          <div className="login-form">
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <Smartphone size={42} style={{ margin: "0 auto 12px" }} />
              <h2 style={{ margin: "0 0 8px" }}>Аппыг суулгах</h2>
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                Ирцийн системийг утасныхаа үндсэн дэлгэцэд нэмээд апп шиг ашиглаарай.
              </p>
            </div>

            {installPrompt ? (
              <button
                type="button"
                className="primary-btn"
                onClick={handleInstall}
                disabled={installing}
              >
                <Download size={18} style={{ verticalAlign: "middle", marginRight: 8 }} />
                {installing ? "Суулгаж байна..." : "Апп суулгах"}
              </button>
            ) : (
              <div style={{ background: "#f3f6fb", padding: 14, borderRadius: 12, marginBottom: 14 }}>
                {isIOS ? (
                  <>
                    <p style={{ margin: "0 0 8px", fontWeight: 600 }}>iPhone / iPad</p>
                    <p style={{ margin: 0, lineHeight: 1.6 }}>
                      Safari-гаар нээгээд <Share size={15} style={{ display: "inline", verticalAlign: "middle" }} /> Share товч → “Add to Home Screen” сонгоно.
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ margin: "0 0 8px", fontWeight: 600 }}>Android / Компьютер</p>
                    <p style={{ margin: 0, lineHeight: 1.6 }}>
                      Chrome-ийн цэснээс “Install app” эсвэл “Add to Home screen” сонгоно.
                    </p>
                  </>
                )}
              </div>
            )}

            <button
              type="button"
              className="primary-btn"
              onClick={onContinue}
              style={{ marginTop: 10, background: "#475569" }}
            >
              <MonitorDown size={18} style={{ verticalAlign: "middle", marginRight: 8 }} />
              Вебээр үргэлжлүүлэх
            </button>

            <p style={{ textAlign: "center", fontSize: 12, color: "#667085", marginTop: 14 }}>
              Суулгах боломжгүй бол вебээр үргэлжлүүлж болно.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
