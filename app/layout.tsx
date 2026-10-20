import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Questrial } from "next/font/google";
import { DemoTour } from "@/components/demo-tour";
import { PwaRegister } from "@/components/pwa";
import "./globals.css";

const questrial = Questrial({ subsets: ["latin"], weight: "400", variable: "--font-questrial", display: "swap" });
const bodoni = Bodoni_Moda({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-bodoni", display: "swap" });

export const metadata: Metadata = {
  title: "Steadfast - Physician-led weight care",
  description: "Secure monitoring platform for a physician-led medical weight-management program: MA data entry, physician review, patient portal.",
  applicationName: "Steadfast",
  appleWebApp: { capable: true, title: "Steadfast", statusBarStyle: "default" },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#4165FE",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${questrial.variable} ${bodoni.variable}`}>
      <body className="bg-background text-text-primary font-sans antialiased">
        {children}
        <PwaRegister />
        <DemoTour />
      </body>
    </html>
  );
}
