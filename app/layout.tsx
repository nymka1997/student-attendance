import type { Metadata } from "next";
import "./globals.css";
import type { Viewport } from "next";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
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
