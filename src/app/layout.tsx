import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ServiceWorkerRegister } from "@/components/mtf/sw-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Trade Finance — Pengelola Investasi Multi-Akun",
  description:
    "Catat akun website investasi, transaksi modal & profit, dan lihat rekap analitik keuangan secara real-time. PWA modern bertema analytics, technology & anime.",
  applicationName: "My Trade Finance",
  keywords: [
    "My Trade Finance",
    "investasi",
    "keuangan",
    "finance",
    "profit",
    "PWA",
    "analytics",
  ],
  authors: [{ name: "My Trade Finance" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "My Trade Finance",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: "My Trade Finance",
    description: "Pengelola keuangan investasi multi-akun dengan analitik real-time.",
    type: "website",
    siteName: "My Trade Finance",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <Sonner position="top-center" />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
