import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Сурагчийн ирц",
  description: "Сургуулийн ирцийн бүртгэлийн систем",
  manifest: "/manifest.webmanifest",
  applicationName: "Сурагчийн ирц",
  appleWebApp: { capable: true, title: "Сурагчийн ирц", statusBarStyle: "default" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="mn"><body>{children}</body></html>;
}
