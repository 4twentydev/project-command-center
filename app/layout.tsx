import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { brand } from "@/lib/brand";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(brand.siteURL),
  title: { default: brand.socialTitle, template: `%s · ${brand.name}` },
  description: brand.positioning,
  alternates: { canonical: "/" },
  openGraph: { siteName: brand.name, type: "website", url: "/", title: brand.socialTitle, description: brand.socialDescription, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${brand.name} — ${brand.descriptor}` }] },
  twitter: { card: "summary_large_image", title: brand.socialTitle, description: brand.socialDescription, images: ["/opengraph-image"] },
  applicationName: brand.name,
  authors: [{ name: brand.founder, url: "/about" }],
  creator: brand.founder,
  publisher: brand.name,
  category: "Industrial software and workflow automation",
  appleWebApp: { capable: true, title: brand.name, statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  ...(process.env.GOOGLE_SITE_VERIFICATION?.trim() ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION.trim() } } : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="antialiased"><ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="work-ctrl-theme">{children}<ServiceWorkerRegister /></ThemeProvider></body>
    </html>
  );
}
