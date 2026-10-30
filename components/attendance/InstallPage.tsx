
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Download,
  Smartphone,
  MonitorDown,
  Share,
  PlusSquare,
  X,
  CheckCircle2,
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
  const [showHelp, setShowHelp] = useState(false);

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

    setIsIOS(
      /iphone|ipad|ipod/i.test(window.navigator.userAgent)
    );

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
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
  }, []);

  const handleInstall = async () => {
    // Android болон дэмждэг компьютерийн браузер
    if (installPrompt) {
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
        setShowHelp(true);
      } finally {
        setInstalling(false);
      }

      return;
    }

    // iPhone болон суулгах цонх дэмждэггүй браузер
    setShowHelp(true);
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
                marginBottom: 28,
              }}
            >
              <Smartphone
                size={50}
                style={{
                  margin: "0 auto 14px",
                  color: "#2563eb",
                }}
              />

              <h2 style={{ margin: "0 0 10px" }}>
                Сурагчийн ирц апп
              </h2>

              <p
                style={{
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Аппыг төхөөрөмждөө суулгаж,
                үндсэн дэлгэцээс шууд ашиглаарай.
              </p>
            </div>

            <button
              type="button"
              className="primary-btn"
              onClick={handleInstall}
              disabled={installing || isInstalled}
            >
              {isInstalled ? (
                <CheckCircle2
                  size={19}
                  style={{
                    verticalAlign: "middle",
                    marginRight: 8,
                  }}
                />
              ) : (
                <Download
                  size={19}
                  style={{
                    verticalAlign: "middle",
                    marginRight: 8,
                  }}
                />
              )}

              {installing
                ? "Суулгаж байна..."
                : isInstalled
                  ? "Апп суусан байна"
                  : "АПП ТАТАХ"}
            </button>

            {showHelp && !isInstalled && (
              <div
                style={{
                  position: "relative",
                  marginTop: 14,
                  padding: 16,
                  background: "#f3f6fb",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  color: "#172033",
                  fontSize: 13,
                  lineHeight: 1.7,
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowHelp(false)}
                  aria-label="Заавар хаах"
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    border: 0,
                    background: "transparent",
                    cursor: "pointer",
                    color: "#64748b",
                  }}
                >
                  <X size={18} />
                </button>

                {isIOS ? (
                  <>
                    <strong>
                      <Share
                        size={17}
                        style={{
                          display: "inline",
                          verticalAlign: "middle",
                          marginRight: 6,
                        }}
                      />
                      iPhone дээр суулгах
                    </strong>

                    <p>
                      1. Энэ сайтыг Safari браузераар нээнэ.
                      <br />
                      2. Доод талын Share товчийг дарна.
                      <br />
                      3. Add to Home Screen сонгоно.
                      <br />
                      4. Add товчийг дарна.
                    </p>

                    <div style={{ textAlign: "center" }}>
                      <PlusSquare
                        size={30}
                        color="#2563eb"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <strong>Апп суулгах</strong>
                    <p>
                      Chrome браузерын цэсийг нээгээд
                      Install app эсвэл Add to Home Screen
                      сонголтыг дарна уу.
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
                marginTop: 14,
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
