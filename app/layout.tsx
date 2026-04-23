import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";

import "@/app/globals.css";

const heading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vpn-bypass-detector.com"),
  title: {
    default: "VPN Bypass Detector | Test VPN Effectiveness Against Censorship",
    template: "%s | VPN Bypass Detector",
  },
  description:
    "Measure how well VPN protocols and providers bypass DNS poisoning, DPI blocking, SNI filtering, and throttling in restricted countries.",
  keywords: [
    "VPN censorship testing",
    "internet freedom",
    "DPI bypass",
    "country VPN reliability",
    "privacy tools",
  ],
  openGraph: {
    title: "VPN Bypass Detector",
    description:
      "Run practical bypass tests against censorship patterns and rank VPN providers by real-world survivability.",
    url: "https://vpn-bypass-detector.com",
    siteName: "VPN Bypass Detector",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VPN Bypass Detector",
    description:
      "Find which VPN protocol still works when governments throttle, inspect, and block traffic.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${heading.variable} ${mono.variable} bg-[#0d1117] text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
