import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.4twenty.dev"),
  title: { default: "4TWENTY.DEV — Useful systems for real-world work", template: "%s · 4TWENTY.DEV" },
  description: "Custom software, workflow automation, and digital fabrication systems built for real-world businesses.",
  alternates: { canonical: "/" },
  openGraph: { siteName: "4TWENTY.DEV", type: "website", url: "/", title: "4TWENTY.DEV — Useful systems for real-world work", description: "Custom software, workflow automation, and digital fabrication systems built for real-world businesses." },
  applicationName: "4TWENTY.DEV",
  appleWebApp: { capable: true, title: "WORK//CTRL", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable}`}>
      <body className="antialiased"><ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="work-ctrl-theme">{children}<ServiceWorkerRegister /></ThemeProvider></body>
    </html>
  );
}
