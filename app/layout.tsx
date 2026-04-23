import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";

import "@/app/globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vpn-bypass-detector.app"),
  title: {
    default: "VPN Bypass Detector",
    template: "%s | VPN Bypass Detector"
  },
  description:
    "Test VPN protocols and providers against real censorship controls. Find what works before you need it.",
  keywords: [
    "VPN censorship test",
    "internet freedom",
    "bypass government blocks",
    "VPN protocol benchmark",
    "privacy tools"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "VPN Bypass Detector",
    description:
      "Real-time VPN bypass testing for censorship-heavy countries. Compare providers, protocols, and block techniques.",
    siteName: "VPN Bypass Detector"
  },
  twitter: {
    card: "summary_large_image",
    title: "VPN Bypass Detector",
    description:
      "Real-time VPN bypass testing for censorship-heavy countries. Compare providers, protocols, and block techniques."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} bg-[#0d1117] text-[#e6edf3] antialiased`}>{children}</body>
    </html>
  );
}
