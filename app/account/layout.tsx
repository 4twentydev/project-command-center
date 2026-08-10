import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Owner account",
  alternates: { canonical: "/account" },
  robots: { index: false, follow: false, noarchive: true },
};

export default function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
