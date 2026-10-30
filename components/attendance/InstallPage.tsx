
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Download,
  Smartphone,
  Share,
  MonitorDown,
  CheckCircle2,
  PlusSquare,
} from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
  }>;
};

export default function InstallPage({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const [installPrompt, setInstallPrompt] =
    useState<InstallPromptEvent | null>(null);

  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & {
          standalone?: boolean;
        }).standalone === true;

      setIsInstalled(standalone);
    };

    checkInstalled();

    const userAgent = window.navigator.userAgent;
    setIsIOS(/iphone|ipad|ipod/i.test(userAgent));

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      onContinue();
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      handleAppInstalled
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled
      );
    };
  }, [onContinue]);

  const handleInstall = async () => {
    if (!installPrompt) return;

    try {
      setInstalling(true);

      await installPrompt.prompt();

      const choice = await installPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setInstallPrompt(null);
      } else {
        setInstallPrompt(null);
      }
    } catch (error) {
      console.error("PWA суулгах алдаа:", error);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="phone-frame">
        <div className="login-page">
          <div className="brand">
            <div className="brand-icon">
              <Image
                src="/icon.svg"
                alt="Сургуулийн лого"
                width={64}
                height={64}
                priority
              />
            </div>

            <h1>Сурагчийн ирц</h1>
            <p>Сургуулийн ирцийн бүртгэлийн систем</p>
          </div>

          <div className="login-form">
            <div
              style={{
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              <Smartphone
                size={48}
                style={{
                  margin: "0 auto 14px",
                  color: "#2563eb",
                }}
              />

              <h2 style={{ margin: "0 0 10px" }}>
                Сурагчийн ирц апп
              </h2>

              <p style={{ margin: 0, lineHeight: 1.7 }}>
                Аппыг төхөөрөмждөө суулгаж,
                үндсэн дэлгэцээс шууд ашиглаарай.
              </p>
            </div>

            {isInstalled ? (
              <div
                style={{
                  background: "#ecfdf5",
                  color: "#047857",
                  padding: 14,
                  borderRadius: 12,
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                <CheckCircle2
                  size={24}
                  style={{ margin: "0 auto 8px" }}
                />
                <strong>Апп суусан байна</strong>
              </div>
            ) : installPrompt ? (
              <button
                type="button"
                className="primary-btn"
                onClick={handleInstall}
                disabled={installing}
              >
                <Download
                  size={19}
                  style={{
                    verticalAlign: "middle",
                    marginRight: 8,
                  }}
                />

                {installing
                  ? "Суулгаж байна..."
                  : "Апп татах / Суулгах"}
              </button>
            ) : (
              <div
                style={{
                  background: "#f3f6fb",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 14,
                }}
              >
                {isIOS ? (
                  <>
                    <p
                      style={{
                        fontWeight: 700,
                        margin: "0 0 12px",
                      }}
                    >
                      <Share
                        size={18}
                        style={{
                          display: "inline",
                          verticalAlign: "middle",
                          marginRight: 7,
                        }}
                      />
                      iPhone / iPad суулгах
                    </p>

                    <p style={{ lineHeight: 1.7, margin: 0 }}>
                      1. Safari браузераар энэ сайтыг нээнэ.
                      <br />
                      2. Доод талын Share товчийг дарна.
                      <br />
                      3. Add to Home Screen сонгоно.
                      <br />
                      4. Add товчийг дарж суулгана.
                    </p>

                    <div
                      style={{
                        textAlign: "center",
                        marginTop: 14,
                        color: "#2563eb",
                      }}
                    >
                      <PlusSquare size={30} />
                    </div>
                  </>
                ) : (
                  <>
                    <p
                      style={{
                        fontWeight: 700,
                        margin: "0 0 10px",
                      }}
                    >
                      <Download
                        size={18}
                        style={{
                          display: "inline",
                          verticalAlign: "middle",
                          marginRight: 7,
                        }}
                      />
                      Апп суулгах
                    </p>

                    <p style={{ lineHeight: 1.7, margin: 0 }}>
                      Chrome браузерын цэсийг нээгээд
                      Install app эсвэл Add to Home Screen
                      сонголтыг дарж суулгана.
                    </p>
                  </>
                )}
              </div>
            )}

            <button
              type="button"
              className="primary-btn"
              onClick={onContinue}
              style={{
                marginTop: 12,
                background: "#475569",
              }}
            >
              <MonitorDown
                size={19}
                style={{
                  verticalAlign: "middle",
                  marginRight: 8,
                }}
              />
              Вебээр үргэлжлүүлэх
            </button>

            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "#667085",
                marginTop: 16,
                lineHeight: 1.6,
              }}
            >
              Апп суулгах боломжгүй бол веб хувилбарыг
              шууд ашиглаж болно.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
