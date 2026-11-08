
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Сурагчийн ирц",
  description: "Сургуулийн ирцийн бүртгэлийн систем",
  manifest: "/manifest.webmanifest",
  applicationName: "Сурагчийн ирц",

  appleWebApp: {
    capable: true,
    title: "Сурагчийн ирц",
    statusBarStyle: "default",
  },

  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body>{children}</body>
    </html>
  );
}
