import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { InstallPrompt } from "@/components/InstallPrompt";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Hebra — La red de barberos",
  description: "Conectá con los mejores barberos y salones de Argentina.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Hebra" },
  icons: {
    apple: [{ url: "/icon-192.png", sizes: "192x192" }],
    icon:  [{ url: "/favicon.png", sizes: "32x32" }, { url: "/icon-192.png", sizes: "192x192" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Hebra" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script dangerouslySetInnerHTML={{
          __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js');});}`
        }} />
      </head>
      <body className="min-h-screen" style={{ background: "#0a0a0a" }}>
        <Navbar />
        <InstallPrompt />
        <main className="pt-14 pb-20 md:pb-0">{children}</main>
      </body>
    </html>
  );
}
